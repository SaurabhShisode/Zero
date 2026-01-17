import { Router } from "express";
import { getDaily, getProblemHistory } from "../controllers/dailyController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getDaily);
router.get("/history/:problemId", requireAuth, getProblemHistory)

export default router;

