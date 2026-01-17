import { Router } from "express";
import {
  createProblem,
  listProblems,
  getProblemById,
  getProblemsByCompany,
  getProblemsBySkill
} from "../controllers/problemController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:id", getProblemById);
router.get("/", listProblems);
router.post("/", createProblem);
router.get("/company/:tag", requireAuth, getProblemsByCompany)
router.get("/skill/:skill", requireAuth, getProblemsBySkill)

export default router;
