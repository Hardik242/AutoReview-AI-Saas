import express, {Express, Request as ExpressRequest} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import {errorHandler} from "./middlewares/error.middleware";
import {env} from "./config/env";

const app: Express = express();

// Trust proxy (Render, Railway, etc. sit behind reverse proxies)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — restricted to frontend origin
app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	}),
);

// Rate limiting — prevent brute-force and abuse
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per window per IP
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later",
	},
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20, // stricter for auth routes
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many login attempts, please try again later",
	},
});

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1", apiLimiter);

app.use(
	express.json({
		limit: "1mb", // prevent payload floods
		verify: (req, _res, buf) => {
			(req as unknown as ExpressRequest & {rawBody?: Buffer}).rawBody = buf;
		},
	}),
);
app.use(express.urlencoded({extended: true, limit: "1mb"}));
app.use(cookieParser());

// API Routes
app.use("/api/v1", routes);

// Global Error Handler
app.use(errorHandler);

export default app;
