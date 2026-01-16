import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listProblemComments,
  listDailyComments,
  addComment
} from "../controllers/discussionController.js";

const router = Router();

router.get("/problem/:problemId", listProblemComments);
router.get("/daily/:dailyProblemId", listDailyComments);
router.post("/daily/:dailyProblemId", requireAuth, addComment);

export default router;
