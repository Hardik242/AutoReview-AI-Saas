import {eq, desc} from "drizzle-orm";
import {db} from "../db";
import {reviewsTable, repositoriesTable} from "../db/schema";

export const getReviewHistory = async (
	userId: number,
	limit: number = 20,
	offset: number = 0,
) => {
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
		.where(eq(reviewsTable.userId, userId))
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
