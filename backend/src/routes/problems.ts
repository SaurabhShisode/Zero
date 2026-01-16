import { Router } from "express";
import {
  createProblem,
  listProblems,
  getProblemById
} from "../controllers/problemController.js";

const router = Router();

router.get("/:id", getProblemById);
router.get("/", listProblems);
router.post("/", createProblem);

export default router;
