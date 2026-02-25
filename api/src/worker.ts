import {Worker, Job} from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import {eq} from "drizzle-orm";
import {ReviewJobData} from "./queues/review.queue";
import {
	processBasicReview,
	processFullReview,
} from "./services/review.processor";
import {db} from "./db";
import {reviewsTable} from "./db/schema";

dotenv.config();

const redisConnection = new IORedis(
	process.env.REDIS_URL || "redis://localhost:6379",
	{
		maxRetriesPerRequest: null,
	},
);

const handleBasicReview = async (job: Job<ReviewJobData>) => {
	console.log(
		`[Worker:Free] Processing PR #${job.data.prNumber} on ${job.data.repoFullName}`,
	);

	try {
		await processBasicReview(job.data);
		console.log(`[Worker:Free] Completed PR #${job.data.prNumber}`);
	} catch (error) {
		console.error(
			`[Worker:Free] Failed PR #${job.data.prNumber}:`,
			(error as Error).message,
		);

		await db
			.update(reviewsTable)
			.set({status: "failed"})
			.where(eq(reviewsTable.prNumber, job.data.prNumber));

		// Don't re-throw — let BullMQ's built-in retry handle it via queue config.
		// Throwing here causes DUPLICATE retries (worker retry + queue retry).
	}
};

const handleFullReview = async (job: Job<ReviewJobData>) => {
	console.log(
		`[Worker:Pro] Processing PR #${job.data.prNumber} on ${job.data.repoFullName}`,
	);

	try {
		await processFullReview(job.data);
		console.log(`[Worker:Pro] Completed PR #${job.data.prNumber}`);
	} catch (error) {
		console.error(
			`[Worker:Pro] Failed PR #${job.data.prNumber}:`,
			(error as Error).message,
		);

		await db
			.update(reviewsTable)
			.set({status: "failed"})
			.where(eq(reviewsTable.prNumber, job.data.prNumber));
	}
};

// drainDelay: how long (ms) to wait before polling Redis again when the queue is empty.
// Default is 5ms (!!). Setting to 5000ms reduces idle polling from ~36K/hr to ~720/hr.
const freeWorker = new Worker<ReviewJobData>("review-free", handleBasicReview, {
	connection: redisConnection,
	concurrency: 2,
	drainDelay: 5000,
});

const proWorker = new Worker<ReviewJobData>("review-pro", handleFullReview, {
	connection: redisConnection,
	concurrency: 5,
	drainDelay: 5000,
});

freeWorker.on("completed", (job) => {
	console.log(`[Worker:Free] Job ${job.id} completed successfully`);
});

freeWorker.on("failed", (job, err) => {
	console.error(`[Worker:Free] Job ${job?.id} failed:`, err.message);
});

proWorker.on("completed", (job) => {
	console.log(`[Worker:Pro] Job ${job.id} completed successfully`);
});

proWorker.on("failed", (job, err) => {
	console.error(`[Worker:Pro] Job ${job?.id} failed:`, err.message);
});

console.log("[Worker] Free worker listening (concurrency: 2, drainDelay: 5s)");
console.log("[Worker] Pro worker listening (concurrency: 5, drainDelay: 5s)");
