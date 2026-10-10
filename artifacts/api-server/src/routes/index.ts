import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import progressRouter from "./progress";
import challengesRouter from "./challenges";
import profileRouter from "./profile";
import savedRouter from "./saved";
import documentsRouter from "./documents";
import adminRouter from "./admin";
import couponsRouter from "./coupons";
import learningRouter from "./learning";
import paymentsRouter from "./payments";
import { requireLearnerAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/conversations", requireLearnerAuth, conversationsRouter);
router.use("/conversations/:id/messages", requireLearnerAuth, messagesRouter);
router.use("/progress", requireLearnerAuth, progressRouter);
router.use("/challenges", requireLearnerAuth, challengesRouter);
router.use("/profile", requireLearnerAuth, profileRouter);
router.use("/saved", requireLearnerAuth, savedRouter);
router.use("/documents", requireLearnerAuth, documentsRouter);
router.use("/admin", adminRouter);
router.use("/coupons", requireLearnerAuth, couponsRouter);
router.use("/learning", requireLearnerAuth, learningRouter);
router.use("/payments", requireLearnerAuth, paymentsRouter);

export default router;
