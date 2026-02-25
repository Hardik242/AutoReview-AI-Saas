import {Request, Response, NextFunction} from "express";
import {
	constructWebhookEvent,
	handleSubscriptionCreated,
	handleSubscriptionDeleted,
} from "../services/stripe.service";
import Stripe from "stripe";

export const handleStripeWebhook = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const sig = req.headers["stripe-signature"] as string;
		const rawBody = (req as Request & {rawBody?: Buffer}).rawBody;

		if (!sig || !rawBody) {
			res
				.status(400)
				.json({success: false, message: "Missing signature or body"});
			return;
		}

		const event = constructWebhookEvent(rawBody, sig);

		switch (event.type) {
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				if (subscription.status === "active") {
					await handleSubscriptionCreated(subscription);
				}
				break;
			}
			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionDeleted(subscription);
				break;
			}
			default:
				console.log(`[Stripe] Unhandled event: ${event.type}`);
		}

		res.status(200).json({received: true});
	} catch (error) {
		next(error);
	}
};
