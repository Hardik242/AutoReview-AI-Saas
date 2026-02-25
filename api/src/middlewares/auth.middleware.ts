import {Request, Response, NextFunction} from "express";
import {
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "../utils/jwt";
import {generateAccessToken} from "../utils/jwt";
import {setAuthCookies} from "../utils/cookies";

interface AuthenticatedRequest extends Request {
	userId?: number;
}

export const authenticate = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const accessToken = req.cookies.access_token;

		if (!accessToken) {
			throw new Error("No access token");
		}

		const payload = verifyAccessToken(accessToken);
		req.userId = payload.userId;
		next();
	} catch {
		const refreshToken = req.cookies.refresh_token;

		if (!refreshToken) {
			res.status(401).json({success: false, message: "Not authenticated"});
			return;
		}

		try {
			const payload = verifyRefreshToken(refreshToken);

			const newAccessToken = generateAccessToken(payload.userId);
			const newRefreshToken = generateRefreshToken(payload.userId);
			setAuthCookies(res, newAccessToken, newRefreshToken);

			req.userId = payload.userId;
			next();
		} catch {
			res
				.status(401)
				.json({success: false, message: "Session expired, please login again"});
			return;
		}
	}
};
