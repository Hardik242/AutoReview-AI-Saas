import IORedis from "ioredis";
import {env} from "./env";

export const redisConnection = new IORedis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
	console.log("[Redis] Connected successfully");
});

redisConnection.on("error", (err) => {
	console.error("[Redis] Connection error:", err.message);
});
