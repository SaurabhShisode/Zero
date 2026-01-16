import { Router } from "express";
import { login, signup, me, googleAuth } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter, createAccountLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/signup", createAccountLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);
router.post("/google", authLimiter, googleAuth);
export default router;
