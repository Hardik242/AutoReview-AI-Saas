import {Router} from "express";
import {
	githubLogin,
	githubCallback,
	logout,
} from "../controllers/auth.controller";

const router = Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/logout", logout);

export default router;
