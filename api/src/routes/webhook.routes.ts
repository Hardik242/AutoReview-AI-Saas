import {Router} from "express";
import {verifyWebhookSignature} from "../middlewares/webhook.middleware";
import {handleGitHubWebhook} from "../controllers/webhook.controller";

const router = Router();

router.post("/github", verifyWebhookSignature, handleGitHubWebhook);

export default router;
