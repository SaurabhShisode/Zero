import { Router } from "express";
import { markSolve } from "../controllers/solveController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.post("/", requireAuth, markSolve);
export default router;
//# sourceMappingURL=solve.js.map