import { Router } from "express";
import { addComment, listComments } from "../controllers/discussionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:dailyProblemId", requireAuth, listComments);
router.post("/:dailyProblemId", requireAuth, addComment);

export default router;

