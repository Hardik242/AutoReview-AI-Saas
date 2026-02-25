import {Response, NextFunction} from "express";
import {getReviewHistory, getReviewById} from "../services/review.service";
import {AuthenticatedRequest} from "../types";

export const listReviews = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;
		const reviews = await getReviewHistory(req.userId!, limit, offset);
		res.status(200).json({success: true, data: reviews});
	} catch (error) {
		next(error);
	}
};

export const getReview = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const reviewId = parseInt(req.params.id as string, 10);
		if (isNaN(reviewId)) {
			res.status(400).json({success: false, message: "Invalid review ID"});
			return;
		}
		const review = await getReviewById(reviewId, req.userId!);
		res.status(200).json({success: true, data: review});
	} catch (error) {
		next(error);
	}
};
