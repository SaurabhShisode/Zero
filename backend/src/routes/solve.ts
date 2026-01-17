import { Router } from "express";
import { markSolve } from "../controllers/solveController.js";
import { requireAuth } from "../middleware/auth.js";
import { isSolved } from "../controllers/solveController.js";

const router = Router();

router.post("/", requireAuth, markSolve);
router.get("/:problemId", requireAuth, isSolved);
export default router;

