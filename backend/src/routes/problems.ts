import { Router } from "express";
import { createProblem, listProblems } from "../controllers/problemController.js";

const router = Router();

router.get("/", listProblems);
router.post("/", createProblem); 

export default router;

