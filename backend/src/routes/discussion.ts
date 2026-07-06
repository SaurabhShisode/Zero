import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import {
  listProblemComments,
  addProblemComment,
  deleteProblemComment,
  getGroupsForMention
} from "../controllers/discussionController.js";

const router = Router();

// optionalAuth: sets req.userId when logged in so group-only comments get filtered correctly.
// Public users still see the route — they just can't see group-only comments.
router.get("/problem/:problemId", optionalAuth, listProblemComments);
router.post("/problem/:problemId", requireAuth, addProblemComment);
router.delete("/comment/:commentId", requireAuth, deleteProblemComment);
router.get("/my-groups", requireAuth, getGroupsForMention);

export default router;
