import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {checkout, portal} from "../controllers/stripe.controller";

const router = Router();

router.use(authenticate);

router.post("/checkout", checkout);
router.post("/portal", portal);

export default router;
