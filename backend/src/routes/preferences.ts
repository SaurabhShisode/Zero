import { Router } from "express"
import {
  updatePreferences,
  getPreferences
} from "../controllers/preferencesController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.get("/", requireAuth, getPreferences)
router.put("/", requireAuth, updatePreferences)

export default router
