import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const env = {
	PORT: process.env.PORT || "8000",
	NODE_ENV: process.env.NODE_ENV || "development",
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

	DATABASE_URL: requireEnv("DATABASE_URL"),

	GITHUB_CLIENT_ID: requireEnv("GITHUB_CLIENT_ID"),
	GITHUB_CLIENT_SECRET: requireEnv("GITHUB_CLIENT_SECRET"),
	GITHUB_REDIRECT_URI: requireEnv("GITHUB_REDIRECT_URI"),

	JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
	JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),

	GITHUB_WEBHOOK_SECRET: requireEnv("GITHUB_WEBHOOK_SECRET"),

	REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

	GOOGLE_GENERATIVE_AI_API_KEY: requireEnv("GOOGLE_GENERATIVE_AI_API_KEY"),

	API_URL: process.env.API_URL || "http://localhost:8000",

	STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
	STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
	STRIPE_PRO_PRICE_ID: requireEnv("STRIPE_PRO_PRICE_ID"),
} as const;
