import {eq, desc} from "drizzle-orm";
import {db} from "../db";
import {reviewsTable} from "../db/schema";

export const getReviewHistory = async (
	userId: number,
	limit: number = 20,
	offset: number = 0,
) => {
	return db
		.select()
		.from(reviewsTable)
		.where(eq(reviewsTable.userId, userId))
		.orderBy(desc(reviewsTable.createdAt))
		.limit(limit)
		.offset(offset);
};

export const getReviewById = async (reviewId: number, userId: number) => {
	const reviews = await db
		.select()
		.from(reviewsTable)
		.where(eq(reviewsTable.id, reviewId));

	if (reviews.length === 0 || reviews[0].userId !== userId) {
		throw Object.assign(new Error("Review not found"), {statusCode: 404});
	}

	return reviews[0];
};
