import {Request, Response, NextFunction} from "express";
import crypto from "crypto";
import {env} from "../config/env";

export const verifyWebhookSignature = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const signature = req.headers["x-hub-signature-256"] as string;

	if (!signature) {
		res
			.status(401)
			.json({success: false, message: "Missing webhook signature"});
		return;
	}

	const rawBody = (req as Request & {rawBody?: Buffer}).rawBody;

	if (!rawBody) {
		res
			.status(400)
			.json({success: false, message: "Missing raw body for verification"});
		return;
	}

	const expectedSignature =
		"sha256=" +
		crypto
			.createHmac("sha256", env.GITHUB_WEBHOOK_SECRET)
			.update(rawBody)
			.digest("hex");

	const isValid = crypto.timingSafeEqual(
		Buffer.from(signature),
		Buffer.from(expectedSignature),
	);

	if (!isValid) {
		res
			.status(401)
			.json({success: false, message: "Invalid webhook signature"});
		return;
	}

	next();
};
