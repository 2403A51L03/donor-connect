import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donorsRouter from "./donors";
import bloodRequestsRouter from "./blood-requests";
import notificationsRouter from "./notifications";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(donorsRouter);
router.use(bloodRequestsRouter);
router.use(notificationsRouter);

export default router;
