import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listProblemComments,
  addProblemComment,
  deleteProblemComment
} from "../controllers/discussionController.js";

const router = Router();

router.get("/problem/:problemId", listProblemComments);
router.post("/problem/:problemId", requireAuth, addProblemComment);
router.delete("/comment/:commentId", requireAuth, deleteProblemComment);

export default router;
