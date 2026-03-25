import { Router, type IRouter } from "express";
import healthRouter from "./health";
import travelRouter from "./travel/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/travel", travelRouter);

export default router;
