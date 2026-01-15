import { Router } from "express";
import { createProblem, listProblems } from "../controllers/problemController.js";
const router = Router();
router.get("/", listProblems);
router.post("/", createProblem); // TODO: add admin auth when roles exist
export default router;
//# sourceMappingURL=problems.js.map