import {Router} from "express";
import {authenticate} from "../middlewares/auth.middleware";
import {
	connect,
	disconnect,
	list,
	listGitHub,
} from "../controllers/repo.controller";

const router = Router();

router.use(authenticate);

router.get("/", list);
router.get("/github", listGitHub);
router.post("/connect", connect);
router.delete("/:id", disconnect);

export default router;
