import {Router} from "express";
import authRoutes from "./auth.routes";
import repoRoutes from "./repo.routes";
import webhookRoutes from "./webhook.routes";
import rulesRoutes from "./rules.routes";
import userRoutes from "./user.routes";
import stripeRoutes from "./stripe.routes";
import reviewRoutes from "./review.routes";
import {handleStripeWebhook} from "../controllers/stripe-webhook.controller";

const router = Router();

router.get("/health", (req, res) => {
	res.status(200).json({
		status: "ok",
		uptime: Math.floor(process.uptime()),
		timestamp: new Date().toISOString(),
	});
});

router.use("/auth", authRoutes);
router.use("/repos", repoRoutes);
router.use("/webhooks", webhookRoutes);
router.post("/webhooks/stripe", handleStripeWebhook);
router.use("/rules", rulesRoutes);
router.use("/user", userRoutes);
router.use("/stripe", stripeRoutes);
router.use("/reviews", reviewRoutes);

export default router;
