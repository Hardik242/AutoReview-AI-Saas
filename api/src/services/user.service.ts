import {eq, sql, and, gte} from "drizzle-orm";
import {db} from "../db";
import {usersTable, repositoriesTable, reviewsTable} from "../db/schema";

export const getUserById = async (userId: number) => {
	const users = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (users.length === 0) {
		throw Object.assign(new Error("User not found"), {statusCode: 404});
	}

	return users[0];
};

export const getUserProfile = async (userId: number) => {
	const user = await getUserById(userId);

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		avatarUrl: user.avatarUrl,
		plan: user.plan,
		reviewsLimit: user.reviewsLimit,
		reviewsUsed: user.reviewsUsed,
		reviewsResetAt: user.reviewsResetAt,
	};
};

export const getUserStats = async (userId: number) => {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [repoCount] = await db
		.select({count: sql<number>`count(*)::int`})
		.from(repositoriesTable)
		.where(eq(repositoriesTable.userId, userId));

	const [reviewTotals] = await db
		.select({
			total: sql<number>`count(*)::int`,
			completed: sql<number>`count(*) filter (where status = 'completed')::int`,
			failed: sql<number>`count(*) filter (where status = 'failed')::int`,
			queued: sql<number>`count(*) filter (where status = 'queued')::int`,
			processing: sql<number>`count(*) filter (where status = 'processing')::int`,
			issuesFound: sql<number>`coalesce(sum(issues_found), 0)::int`,
		})
		.from(reviewsTable)
		.where(eq(reviewsTable.userId, userId));

	const [monthlyReviews] = await db
		.select({count: sql<number>`count(*)::int`})
		.from(reviewsTable)
		.where(
			and(
				eq(reviewsTable.userId, userId),
				gte(reviewsTable.createdAt, thirtyDaysAgo),
			),
		);

	const dailyReviews = await db
		.select({
			date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
			count: sql<number>`count(*)::int`,
		})
		.from(reviewsTable)
		.where(
			and(
				eq(reviewsTable.userId, userId),
				gte(reviewsTable.createdAt, thirtyDaysAgo),
			),
		)
		.groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
		.orderBy(sql`to_char(created_at, 'YYYY-MM-DD')`);

	return {
		totalRepos: repoCount.count,
		totalReviews: reviewTotals.total,
		monthlyReviews: monthlyReviews.count,
		completed: reviewTotals.completed,
		failed: reviewTotals.failed,
		queued: reviewTotals.queued,
		processing: reviewTotals.processing,
		issuesFound: reviewTotals.issuesFound,
		successRate:
			reviewTotals.total > 0
				? Math.round((reviewTotals.completed / reviewTotals.total) * 100)
				: 0,
		dailyReviews,
	};
};
