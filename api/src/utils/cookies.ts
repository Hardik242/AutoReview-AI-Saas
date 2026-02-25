import {Response} from "express";
import {env} from "../config/env";

const isProduction = env.NODE_ENV === "production";

// With Vercel proxy, cookies are same-origin in production.
// sameSite: "lax" is secure and works in all browsers (including Brave).
const cookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: "lax" as const,
};

export const setAuthCookies = (
	res: Response,
	accessToken: string,
	refreshToken: string,
) => {
	res.cookie("access_token", accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refresh_token", refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});
};

export const clearAuthCookies = (res: Response) => {
	res.clearCookie("access_token", cookieOptions);
	res.clearCookie("refresh_token", {...cookieOptions, path: "/"});
};
