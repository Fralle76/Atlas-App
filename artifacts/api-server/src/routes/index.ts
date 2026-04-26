import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transitionsRouter from "./transitions";
import atlasRouter from "./atlas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transitionsRouter);
router.use(atlasRouter);

export default router;
