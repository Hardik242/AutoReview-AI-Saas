import {Response, NextFunction} from "express";
import {getUserProfile, getUserStats} from "../services/user.service";
import {AuthenticatedRequest} from "../types";

export const getProfile = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const profile = await getUserProfile(req.userId!);
		res.status(200).json({success: true, data: profile});
	} catch (error) {
		next(error);
	}
};

export const getStats = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const stats = await getUserStats(req.userId!);
		res.status(200).json({success: true, data: stats});
	} catch (error) {
		next(error);
	}
};
