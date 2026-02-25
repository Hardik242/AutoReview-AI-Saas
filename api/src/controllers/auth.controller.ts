import {Request, Response, NextFunction} from "express";
import {env} from "../config/env";
import {
	exchangeCodeForToken,
	getGitHubUser,
	findOrCreateUser,
} from "../services/auth.service";
import {generateAccessToken, generateRefreshToken} from "../utils/jwt";
import {setAuthCookies, clearAuthCookies} from "../utils/cookies";

export const githubLogin = (req: Request, res: Response) => {
	const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${env.GITHUB_REDIRECT_URI}&scope=user:email,repo`;

	res.redirect(githubAuthUrl);
};

export const githubCallback = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {code} = req.query;

		if (!code || typeof code !== "string") {
			res
				.status(400)
				.json({success: false, message: "Missing authorization code"});
			return;
		}

		const githubAccessToken = await exchangeCodeForToken(code);
		const githubUser = await getGitHubUser(githubAccessToken);
		const user = await findOrCreateUser(githubUser, githubAccessToken);

		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		setAuthCookies(res, accessToken, refreshToken);

		res.redirect(env.CLIENT_URL + "/dashboard");
	} catch (error) {
		next(error);
	}
};

export const logout = (req: Request, res: Response) => {
	clearAuthCookies(res);
	res.status(200).json({success: true, message: "Logged out successfully"});
};
