import {eq} from "drizzle-orm";
import {db} from "../db";
import {usersTable, reviewsTable} from "../db/schema";
import {ReviewJobData} from "../queues/review.queue";
import {
	createOctokitClient,
	getPRFiles,
	postPRSummaryComment,
	postPRInlineComments,
	pushFileFix,
	PRComment,
} from "./github.service";
import {
	generateBasicReview,
	generateFullReview,
	ReviewResult,
} from "./gemini.service";
import {findSimilarCode} from "./rag.service";
import {getActiveUserRules} from "./rules.service";

const formatSummaryComment = (
	review: ReviewResult,
	reviewType: string,
): string => {
	const emoji = review.issues.length === 0 ? "✅" : "🔍";
	const criticals = review.issues.filter(
		(i) => i.severity === "critical",
	).length;
	const warnings = review.issues.filter((i) => i.severity === "warning").length;
	const suggestions = review.issues.filter(
		(i) => i.severity === "suggestion",
	).length;

	let body = `## ${emoji} AutoReview AI — ${reviewType === "full" ? "Pro" : "Basic"} Review\n\n`;
	body += `${review.summary}\n\n`;

	if (review.issues.length > 0) {
		body += `**Found ${review.issues.length} issue(s):** `;
		body += `🔴 ${criticals} critical, 🟡 ${warnings} warnings, 🔵 ${suggestions} suggestions\n\n`;
		body += "| Severity | File | Line | Category | Issue |\n";
		body += "|----------|------|------|----------|-------|\n";

		for (const issue of review.issues) {
			const icon =
				issue.severity === "critical"
					? "🔴"
					: issue.severity === "warning"
						? "🟡"
						: "🔵";
			body += `| ${icon} ${issue.severity} | \`${issue.file}\` | L${issue.line} | ${issue.category} | ${issue.message} |\n`;
		}
	}

	body += "\n---\n*Powered by AutoReview AI*";
	return body;
};

export const processBasicReview = async (jobData: ReviewJobData) => {
	const [owner, repo] = jobData.repoFullName.split("/");

	await db
		.update(reviewsTable)
		.set({status: "processing"})
		.where(eq(reviewsTable.prNumber, jobData.prNumber));

	const user = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, jobData.userId));

	if (!user[0]?.githubAccessToken) {
		throw new Error("User GitHub access token not found");
	}

	const octokit = createOctokitClient(user[0].githubAccessToken);
	const files = await getPRFiles(octokit, owner, repo, jobData.prNumber);

	const review = await generateBasicReview(files);

	const summaryBody = formatSummaryComment(review, "basic");
	await postPRSummaryComment(
		octokit,
		owner,
		repo,
		jobData.prNumber,
		summaryBody,
	);

	await db
		.update(reviewsTable)
		.set({
			status: "completed",
			summary: review.summary,
			issuesFound: review.issues.length,
			completedAt: new Date(),
		})
		.where(eq(reviewsTable.prNumber, jobData.prNumber));
};

export const processFullReview = async (jobData: ReviewJobData) => {
	const [owner, repo] = jobData.repoFullName.split("/");

	await db
		.update(reviewsTable)
		.set({status: "processing"})
		.where(eq(reviewsTable.prNumber, jobData.prNumber));

	const user = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, jobData.userId));

	if (!user[0]?.githubAccessToken) {
		throw new Error("User GitHub access token not found");
	}

	const octokit = createOctokitClient(user[0].githubAccessToken);
	const files = await getPRFiles(octokit, owner, repo, jobData.prNumber);

	const diffText = files
		.filter((f) => f.patch)
		.map((f) => `${f.filename}:\n${f.patch}`)
		.join("\n");
	const repoContext = await findSimilarCode(jobData.repoId, diffText);

	const userRules = await getActiveUserRules(jobData.userId);
	const customRules = userRules.map((r) => r.rule);

	const review = await generateFullReview(files, repoContext, customRules);

	const summaryBody = formatSummaryComment(review, "full");
	await postPRSummaryComment(
		octokit,
		owner,
		repo,
		jobData.prNumber,
		summaryBody,
	);

	const inlineComments: PRComment[] = review.issues
		.filter((issue) => issue.line > 0)
		.map((issue) => ({
			path: issue.file,
			line: issue.line,
			body: `**${issue.severity.toUpperCase()}** (${issue.category}): ${issue.message}${issue.fix ? `\n\n**Suggested fix:**\n\`\`\`\n${issue.fix}\n\`\`\`` : ""}`,
		}));

	if (inlineComments.length > 0) {
		await postPRInlineComments(
			octokit,
			owner,
			repo,
			jobData.prNumber,
			jobData.headSha,
			inlineComments,
		);
	}

	if (jobData.autoFixEnabled) {
		const fixableIssues = review.issues.filter(
			(i) => i.fix && (i.severity === "critical" || i.severity === "warning"),
		);

		for (const issue of fixableIssues) {
			try {
				await pushFileFix(
					octokit,
					owner,
					repo,
					jobData.headRef,
					issue.file,
					issue.fix!,
					`fix: ${issue.message} (AutoReview AI)`,
				);
			} catch (err) {
				console.error(
					`[AutoFix] Failed to fix ${issue.file}:`,
					(err as Error).message,
				);
			}
		}
	}

	await db
		.update(reviewsTable)
		.set({
			status: "completed",
			summary: review.summary,
			issuesFound: review.issues.length,
			completedAt: new Date(),
		})
		.where(eq(reviewsTable.prNumber, jobData.prNumber));
};
