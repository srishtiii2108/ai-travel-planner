import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import travelRouter from "./travel/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/travel", travelRouter);

export default router;
