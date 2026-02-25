import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {getProfile, getStats} from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.get("/stats", getStats);

export default router;
