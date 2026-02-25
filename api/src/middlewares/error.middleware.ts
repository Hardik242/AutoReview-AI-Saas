import {NextFunction, Request, Response} from "express";

export interface AppError extends Error {
	statusCode?: number;
}

export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const statusCode = err.statusCode || 500;
	const isDev = process.env.NODE_ENV === "development";

	// Log full error in all environments
	console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
	if (isDev) console.error(err.stack);

	// Never leak internal error messages or stack traces in production
	res.status(statusCode).json({
		success: false,
		message: statusCode === 500 ? "Internal Server Error" : err.message,
		...(isDev && {stack: err.stack}),
	});
};
