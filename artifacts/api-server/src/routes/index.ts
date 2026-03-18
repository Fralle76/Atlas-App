import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transitionsRouter from "./transitions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transitionsRouter);

export default router;
