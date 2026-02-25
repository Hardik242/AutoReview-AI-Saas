import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {
	getProfile,
	toggleAutoFix,
	getStats,
} from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.get("/stats", getStats);
router.patch("/auto-fix", toggleAutoFix);

export default router;
