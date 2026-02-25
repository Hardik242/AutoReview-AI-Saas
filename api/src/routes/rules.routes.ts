import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {create, list, remove, toggle} from "../controllers/rules.controller";

const router = Router();

router.use(authenticate);

router.get("/", list);
router.post("/", create);
router.delete("/:id", remove);
router.patch("/:id/toggle", toggle);

export default router;
