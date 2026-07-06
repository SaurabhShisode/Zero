import { Router } from "express";
import { getAnalyticsData, getRevisions } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAnalyticsData);
router.get("/revisions", requireAuth, getRevisions);

export default router;
