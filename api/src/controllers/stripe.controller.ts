import {Response, NextFunction} from "express";
import {
	createCheckoutSession,
	createPortalSession,
} from "../services/stripe.service";
import {AuthenticatedRequest} from "../types";

export const checkout = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const url = await createCheckoutSession(req.userId!);
		res.status(200).json({success: true, data: {url}});
	} catch (error) {
		next(error);
	}
};

export const portal = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const url = await createPortalSession(req.userId!);
		res.status(200).json({success: true, data: {url}});
	} catch (error) {
		next(error);
	}
};
