import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {listReviews, getReview} from "../controllers/review.controller";

const router = Router();

router.use(authenticate);

router.get("/", listReviews);
router.get("/:id", getReview);

export default router;
