import {eq, and} from "drizzle-orm";
import {db} from "../db";
import {repositoriesTable} from "../db/schema";

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

	const newRepo = await db
		.insert(repositoriesTable)
		.values({userId, githubRepoId, fullName})
		.returning();

	return newRepo[0];
};

export const disconnectRepository = async (repoId: number, userId: number) => {
	const deleted = await db
		.delete(repositoriesTable)
		.where(
			and(
				eq(repositoriesTable.id, repoId),
				eq(repositoriesTable.userId, userId),
			),
		)
		.returning();

	if (deleted.length === 0) {
		throw Object.assign(new Error("Repository not found"), {statusCode: 404});
	}

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
