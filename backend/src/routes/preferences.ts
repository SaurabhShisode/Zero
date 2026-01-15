import { Router } from "express";
import { updatePreferences } from "../controllers/preferencesController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.put("/", requireAuth, updatePreferences);

export default router;

