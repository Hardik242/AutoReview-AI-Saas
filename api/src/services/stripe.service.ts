import Stripe from "stripe";
import {eq} from "drizzle-orm";
import {db} from "../db";
import {usersTable} from "../db/schema";
import {env} from "../config/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const PRO_LIMITS = {reviewsLimit: 300};
const FREE_LIMITS = {reviewsLimit: 30};

export const createCheckoutSession = async (userId: number) => {
	const users = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));
	const user = users[0];

	if (!user) {
		throw Object.assign(new Error("User not found"), {statusCode: 404});
	}

	if (user.plan === "pro") {
		throw Object.assign(new Error("Already subscribed to Pro"), {
			statusCode: 400,
		});
	}

	let customerId = user.stripeCustomerId;

	if (!customerId) {
		const customer = await stripe.customers.create({
			metadata: {userId: String(userId)},
			email: user.email || undefined,
		});

		customerId = customer.id;

		await db
			.update(usersTable)
			.set({stripeCustomerId: customerId})
			.where(eq(usersTable.id, userId));
	}

	const session = await stripe.checkout.sessions.create({
		customer: customerId,
		mode: "subscription",
		payment_method_types: ["card"],
		line_items: [{price: env.STRIPE_PRO_PRICE_ID, quantity: 1}],
		success_url: `${env.CLIENT_URL}/dashboard?upgraded=true`,
		cancel_url: `${env.CLIENT_URL}/pricing?cancelled=true`,
		metadata: {userId: String(userId)},
	});

	return session.url;
};

export const createPortalSession = async (userId: number) => {
	const users = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));
	const user = users[0];

	if (!user?.stripeCustomerId) {
		throw Object.assign(new Error("No active subscription found"), {
			statusCode: 400,
		});
	}

	const session = await stripe.billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: `${env.CLIENT_URL}/dashboard`,
	});

	return session.url;
};

export const handleSubscriptionCreated = async (
	subscription: Stripe.Subscription,
) => {
	const customerId = subscription.customer as string;

	await db
		.update(usersTable)
		.set({
			plan: "pro",
			reviewsLimit: PRO_LIMITS.reviewsLimit,
			stripeSubscriptionId: subscription.id,
			updatedAt: new Date(),
		})
		.where(eq(usersTable.stripeCustomerId, customerId));
};

export const handleSubscriptionDeleted = async (
	subscription: Stripe.Subscription,
) => {
	const customerId = subscription.customer as string;

	await db
		.update(usersTable)
		.set({
			plan: "free",
			reviewsLimit: FREE_LIMITS.reviewsLimit,
			stripeSubscriptionId: null,
			updatedAt: new Date(),
		})
		.where(eq(usersTable.stripeCustomerId, customerId));
};

export const constructWebhookEvent = (
	rawBody: Buffer,
	signature: string,
): Stripe.Event => {
	return stripe.webhooks.constructEvent(
		rawBody,
		signature,
		env.STRIPE_WEBHOOK_SECRET,
	);
};
