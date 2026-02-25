import {Response, NextFunction} from "express";
import {
	getUserProfile,
	updateAutoFix,
	getUserStats,
} from "../services/user.service";
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

export const toggleAutoFix = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {enabled} = req.body;

		if (typeof enabled !== "boolean") {
			res
				.status(400)
				.json({success: false, message: "enabled must be a boolean"});
			return;
		}

		const user = await updateAutoFix(req.userId!, enabled);
		res
			.status(200)
			.json({success: true, data: {autoFixEnabled: user.autoFixEnabled}});
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
