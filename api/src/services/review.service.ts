import {eq, desc, gte, and} from "drizzle-orm";
import {db} from "../db";
import {reviewsTable, repositoriesTable, usersTable} from "../db/schema";

export const getReviewHistory = async (
	userId: number,
	limit: number = 20,
	offset: number = 0,
) => {
	const user = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (!user[0]) {
		throw new Error("User not found");
	}

	const daysLimit = user[0].plan === "pro" ? 90 : 7;
	const limitDate = new Date();
	limitDate.setDate(limitDate.getDate() - daysLimit);

	return db
		.select({
			id: reviewsTable.id,
			repositoryId: reviewsTable.repositoryId,
			repoFullName: repositoriesTable.fullName,
			userId: reviewsTable.userId,
			prNumber: reviewsTable.prNumber,
			prTitle: reviewsTable.prTitle,
			status: reviewsTable.status,
			reviewType: reviewsTable.reviewType,
			summary: reviewsTable.summary,
			issuesFound: reviewsTable.issuesFound,
			createdAt: reviewsTable.createdAt,
			completedAt: reviewsTable.completedAt,
		})
		.from(reviewsTable)
		.leftJoin(
			repositoriesTable,
			eq(reviewsTable.repositoryId, repositoriesTable.id),
		)
		.where(
			and(
				eq(reviewsTable.userId, userId),
				gte(reviewsTable.createdAt, limitDate),
			),
		)
		.orderBy(desc(reviewsTable.createdAt))
		.limit(limit)
		.offset(offset);
};

export const getReviewById = async (reviewId: number, userId: number) => {
	const reviews = await db
		.select({
			id: reviewsTable.id,
			repositoryId: reviewsTable.repositoryId,
			repoFullName: repositoriesTable.fullName,
			userId: reviewsTable.userId,
			prNumber: reviewsTable.prNumber,
			prTitle: reviewsTable.prTitle,
			status: reviewsTable.status,
			reviewType: reviewsTable.reviewType,
			summary: reviewsTable.summary,
			issuesFound: reviewsTable.issuesFound,
			createdAt: reviewsTable.createdAt,
			completedAt: reviewsTable.completedAt,
		})
		.from(reviewsTable)
		.leftJoin(
			repositoriesTable,
			eq(reviewsTable.repositoryId, repositoriesTable.id),
		)
		.where(eq(reviewsTable.id, reviewId));

	if (reviews.length === 0 || reviews[0].userId !== userId) {
		throw Object.assign(new Error("Review not found"), {statusCode: 404});
	}

	return reviews[0];
};
