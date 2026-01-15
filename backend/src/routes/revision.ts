import { Router } from "express";
import { getPendingRevisions, markRevisionDone } from "../controllers/revisionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/pending", requireAuth, getPendingRevisions);
router.post("/:id/done", requireAuth, markRevisionDone);

export default router;