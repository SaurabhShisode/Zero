import { Router } from "express";
import { getDaily } from "../controllers/dailyController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getDaily);

export default router;

