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
