import {Response} from "express";
import {env} from "../config/env";

const isProduction = env.NODE_ENV === "production";

export const setAuthCookies = (
	res: Response,
	accessToken: string,
	refreshToken: string,
) => {
	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "lax" : "strict", // "lax" needed for GitHub OAuth redirect to send cookies
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "lax" : "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		path: "/", // Must be "/" so auth middleware can read it for token rotation
	});
};

export const clearAuthCookies = (res: Response) => {
	res.clearCookie("access_token");
	res.clearCookie("refresh_token", {path: "/"});
};
