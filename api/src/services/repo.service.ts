import {eq, and} from "drizzle-orm";
import {db} from "../db";
import {repositoriesTable} from "../db/schema";
import {createRepoWebhook, deleteRepoWebhook} from "./github.service";
import {getUserById} from "./user.service";
import {env} from "../config/env";

const getWebhookUrl = () => {
	// In production, CLIENT_URL's API equivalent. We derive it from CLIENT_URL or use a dedicated env var.
	const apiBase =
		process.env.API_URL || env.CLIENT_URL.replace("://", "://api.");
	// Fallback: use the configured redirect URI's origin
	const origin = env.GITHUB_REDIRECT_URI.replace(
		/\/api\/v1\/auth\/github\/callback$/,
		"",
	);
	return `${origin}/api/v1/webhooks/github`;
};

export const connectRepository = async (
	userId: number,
	githubRepoId: string,
	fullName: string,
) => {
	const existing = await db
		.select()
		.from(repositoriesTable)
		.where(eq(repositoriesTable.githubRepoId, githubRepoId));

	if (existing.length > 0) {
		throw Object.assign(new Error("Repository is already connected"), {
			statusCode: 409,
		});
	}

	// Auto-register GitHub webhook
	const user = await getUserById(userId);
	if (!user.githubAccessToken) {
		throw Object.assign(new Error("GitHub access token not found"), {
			statusCode: 401,
		});
	}

	const [owner, repo] = fullName.split("/");
	let webhookId: string | null = null;

	try {
		const hookId = await createRepoWebhook(
			user.githubAccessToken,
			owner,
			repo,
			getWebhookUrl(),
			env.GITHUB_WEBHOOK_SECRET,
		);
		webhookId = String(hookId);
		console.log(`[Webhook] Created webhook ${hookId} for ${fullName}`);
	} catch (err: any) {
		// If webhook creation fails (e.g. no admin access), still connect the repo
		console.error(
			`[Webhook] Failed to create webhook for ${fullName}:`,
			err.message,
		);
	}

	const newRepo = await db
		.insert(repositoriesTable)
		.values({userId, githubRepoId, fullName, webhookId})
		.returning();

	return newRepo[0];
};

export const disconnectRepository = async (repoId: number, userId: number) => {
	const repos = await db
		.select()
		.from(repositoriesTable)
		.where(
			and(
				eq(repositoriesTable.id, repoId),
				eq(repositoriesTable.userId, userId),
			),
		);

	if (repos.length === 0) {
		throw Object.assign(new Error("Repository not found"), {statusCode: 404});
	}

	const repo = repos[0];

	// Auto-delete GitHub webhook
	if (repo.webhookId) {
		const user = await getUserById(userId);
		if (user.githubAccessToken) {
			const [owner, repoName] = repo.fullName.split("/");
			try {
				await deleteRepoWebhook(
					user.githubAccessToken,
					owner,
					repoName,
					parseInt(repo.webhookId, 10),
				);
				console.log(
					`[Webhook] Deleted webhook ${repo.webhookId} for ${repo.fullName}`,
				);
			} catch (err: any) {
				console.error(
					`[Webhook] Failed to delete webhook for ${repo.fullName}:`,
					err.message,
				);
			}
		}
	}

	const deleted = await db
		.delete(repositoriesTable)
		.where(
			and(
				eq(repositoriesTable.id, repoId),
				eq(repositoriesTable.userId, userId),
			),
		)
		.returning();

	return deleted[0];
};

export const getUserRepositories = async (userId: number) => {
	return db
		.select()
		.from(repositoriesTable)
		.where(eq(repositoriesTable.userId, userId));
};

export const getRepositoryByFullName = async (fullName: string) => {
	const repos = await db
		.select()
		.from(repositoriesTable)
		.where(
			and(
				eq(repositoriesTable.fullName, fullName),
				eq(repositoriesTable.isActive, true),
			),
		);

	return repos[0] || null;
};
