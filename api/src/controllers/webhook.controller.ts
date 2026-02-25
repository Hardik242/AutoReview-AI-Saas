import {Request, Response, NextFunction} from "express";
import {eq} from "drizzle-orm";
import {getRepositoryByFullName} from "../services/repo.service";
import {db} from "../db";
import {usersTable, reviewsTable} from "../db/schema";
import {freeReviewQueue, proReviewQueue} from "../queues/review.queue";

interface PullRequestPayload {
	action: string;
	number: number;
	pull_request: {
		title: string;
		head: {sha: string; ref: string};
		base: {ref: string};
	};
	repository: {
		full_name: string;
	};
}

export const handleGitHubWebhook = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const event = req.headers["x-github-event"] as string;

		if (event !== "pull_request") {
			res.status(200).json({success: true, message: `Ignored event: ${event}`});
			return;
		}

		const payload = req.body as PullRequestPayload;
		const {action, number, pull_request, repository} = payload;

		if (action !== "opened" && action !== "synchronize") {
			res
				.status(200)
				.json({success: true, message: `Ignored PR action: ${action}`});
			return;
		}

		const repo = await getRepositoryByFullName(repository.full_name);

		if (!repo) {
			res.status(200).json({success: true, message: "Repository not tracked"});
			return;
		}

		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, repo.userId));

		const user = users[0];

		if (!user) {
			res
				.status(200)
				.json({success: true, message: "Repository owner not found"});
			return;
		}

		if (user.reviewsUsed >= user.reviewsLimit) {
			res
				.status(200)
				.json({success: true, message: "Monthly review limit reached"});
			return;
		}

		const reviewType = user.plan === "pro" ? "full" : "basic";
		const queue = user.plan === "pro" ? proReviewQueue : freeReviewQueue;

		const review = await db
			.insert(reviewsTable)
			.values({
				repositoryId: repo.id,
				userId: user.id,
				prNumber: number,
				prTitle: pull_request.title,
				status: "queued",
				reviewType,
			})
			.returning();

		await db
			.update(usersTable)
			.set({reviewsUsed: user.reviewsUsed + 1})
			.where(eq(usersTable.id, user.id));

		await queue.add(`pr-${number}`, {
			repoId: repo.id,
			userId: user.id,
			prNumber: number,
			prTitle: pull_request.title,
			repoFullName: repository.full_name,
			headSha: pull_request.head.sha,
			headRef: pull_request.head.ref,
			baseRef: pull_request.base.ref,
			reviewType,
		});

		res.status(200).json({
			success: true,
			message: `PR #${number} queued for ${reviewType} review`,
			reviewId: review[0].id,
		});
	} catch (error) {
		next(error);
	}
};
