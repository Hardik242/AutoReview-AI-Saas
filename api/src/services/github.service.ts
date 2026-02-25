import {Octokit} from "octokit";

export interface PRFile {
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	patch?: string;
}

export interface PRComment {
	path: string;
	line: number;
	body: string;
	side?: "LEFT" | "RIGHT";
}

export const createOctokitClient = (accessToken: string) => {
	return new Octokit({auth: accessToken});
};

export const getPRFiles = async (
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
): Promise<PRFile[]> => {
	const {data} = await octokit.rest.pulls.listFiles({
		owner,
		repo,
		pull_number: prNumber,
		per_page: 100,
	});

	return data.map(
		(file: {
			filename: string;
			status: string;
			additions: number;
			deletions: number;
			patch?: string;
		}) => ({
			filename: file.filename,
			status: file.status,
			additions: file.additions,
			deletions: file.deletions,
			patch: file.patch,
		}),
	);
};

export const getPullRequestRawDiff = async (
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
): Promise<string> => {
	const {data} = await octokit.rest.pulls.get({
		owner,
		repo,
		pull_number: prNumber,
		mediaType: {
			format: "diff",
		},
	});
	return data as unknown as string;
};

export const postPRSummaryComment = async (
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
	body: string,
) => {
	await octokit.rest.issues.createComment({
		owner,
		repo,
		issue_number: prNumber,
		body,
	});
};

export const postPRInlineComments = async (
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
	commitSha: string,
	comments: PRComment[],
) => {
	await octokit.rest.pulls.createReview({
		owner,
		repo,
		pull_number: prNumber,
		commit_id: commitSha,
		event: "COMMENT",
		comments: comments.map((c) => ({
			path: c.path,
			line: c.line,
			body: c.body,
			side: c.side || "RIGHT",
		})),
	});
};

export const pushFileFix = async (
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
	filePath: string,
	newContent: string,
	commitMessage: string,
) => {
	const {data: currentFile} = await octokit.rest.repos.getContent({
		owner,
		repo,
		path: filePath,
		ref: branch,
	});

	if (Array.isArray(currentFile) || currentFile.type !== "file") {
		throw new Error(`Cannot update ${filePath}: not a file`);
	}

	await octokit.rest.repos.createOrUpdateFileContents({
		owner,
		repo,
		path: filePath,
		message: commitMessage,
		content: Buffer.from(newContent).toString("base64"),
		sha: currentFile.sha,
		branch,
	});
};

export const listGitHubRepos = async (accessToken: string) => {
	const octokit = createOctokitClient(accessToken);
	const repos = await octokit.rest.repos.listForAuthenticatedUser({
		sort: "updated",
		per_page: 100,
		type: "owner",
	});

	type Repo = (typeof repos.data)[number];

	return repos.data.map((r: Repo) => ({
		id: String(r.id),
		fullName: r.full_name,
		name: r.name,
		private: r.private,
		description: r.description,
		language: r.language,
		updatedAt: r.updated_at,
	}));
};

export const createRepoWebhook = async (
	accessToken: string,
	owner: string,
	repo: string,
	webhookUrl: string,
	webhookSecret: string,
): Promise<number> => {
	const octokit = createOctokitClient(accessToken);
	const {data} = await octokit.rest.repos.createWebhook({
		owner,
		repo,
		config: {
			url: webhookUrl,
			content_type: "json",
			secret: webhookSecret,
			insecure_ssl: "0",
		},
		events: ["pull_request"],
		active: true,
	});
	return data.id;
};

export const deleteRepoWebhook = async (
	accessToken: string,
	owner: string,
	repo: string,
	webhookId: number,
): Promise<void> => {
	const octokit = createOctokitClient(accessToken);
	try {
		await octokit.rest.repos.deleteWebhook({owner, repo, hook_id: webhookId});
	} catch (err: any) {
		// 404 means webhook already deleted — that's fine
		if (err.status !== 404) throw err;
	}
};
