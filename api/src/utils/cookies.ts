import {Response} from "express";
import {env} from "../config/env";

const isProduction = env.NODE_ENV === "production";

// In production, API (onrender.com) and client (vercel.app) are on different domains.
// sameSite: "none" + secure: true allows cross-site cookies to be sent with
// credentialed fetch() requests. Without this, the browser silently drops cookies.
const cookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
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
