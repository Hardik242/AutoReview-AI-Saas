import {eq} from "drizzle-orm";
import {db} from "../db";
import {usersTable, reviewsTable} from "../db/schema";
import {ReviewJobData} from "../queues/review.queue";
import {
	createOctokitClient,
	getPullRequestRawDiff,
	postPRSummaryComment,
	postPRInlineComments,
	PRComment,
} from "./github.service";
import {generateBasicReview, generateFullReview} from "./gemini.service";
import {findSimilarCode} from "./rag.service";
import {getActiveUserRules} from "./rules.service";

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
	const rawDiff = await getPullRequestRawDiff(
		octokit,
		owner,
		repo,
		jobData.prNumber,
	);

	const review = await generateBasicReview(jobData.prTitle, rawDiff);

	await postPRSummaryComment(
		octokit,
		owner,
		repo,
		jobData.prNumber,
		review.summary,
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
	const rawDiff = await getPullRequestRawDiff(
		octokit,
		owner,
		repo,
		jobData.prNumber,
	);

	const repoContextQuery = jobData.prTitle; // use title as the rag query
	const repoContext = await findSimilarCode(jobData.repoId, repoContextQuery);

	const userRules = await getActiveUserRules(jobData.userId);
	const customRules = userRules.map((r) => r.rule);

	const contextBlocks = [
		...customRules.map((r) => `Custom Rule to enforce: ${r}`),
	];
	if (repoContext) {
		contextBlocks.push(repoContext);
	}

	const review = await generateFullReview(
		jobData.prTitle,
		rawDiff,
		contextBlocks,
	);

	await postPRSummaryComment(
		octokit,
		owner,
		repo,
		jobData.prNumber,
		review.summary,
	);

	const inlineComments: PRComment[] = review.issues
		.filter((issue) => issue.line > 0)
		.map((issue) => ({
			path: issue.file,
			line: issue.line,
			body: `**${issue.severity.toUpperCase()}** (${issue.category}): ${issue.message}`,
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
