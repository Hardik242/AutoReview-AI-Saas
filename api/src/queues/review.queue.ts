import {Queue} from "bullmq";
import {redisConnection} from "../config/redis";

export interface ReviewJobData {
	repoId: number;
	userId: number;
	prNumber: number;
	prTitle: string;
	repoFullName: string;
	headSha: string;
	headRef: string;
	baseRef: string;
	reviewType: "basic" | "full";
}

export const freeReviewQueue = new Queue<ReviewJobData>("review-free", {
	connection: redisConnection,
	defaultJobOptions: {
		attempts: 2, // reduced from 3 — each retry calls Gemini again
		backoff: {type: "exponential", delay: 30000}, // 30s base delay (was 5s — too fast, triggers rate limits)
		removeOnComplete: {count: 50}, // keep fewer completed jobs
		removeOnFail: {count: 20},
	},
});

export const proReviewQueue = new Queue<ReviewJobData>("review-pro", {
	connection: redisConnection,
	defaultJobOptions: {
		attempts: 2,
		backoff: {type: "exponential", delay: 60000}, // 60s base delay for Pro (more API calls per review)
		removeOnComplete: {count: 100},
		removeOnFail: {count: 50},
	},
});
