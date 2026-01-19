import { Router } from "express"
import {
  createBug,
  getBugs,
  deleteBug,
  updateBugStatus
} from "../controllers/bugController.js"

import { requireAuth } from "../middleware/auth.js"
import { requireAdminByEmail } from "../middleware/requireAdminByEmail.js"

const router = Router()

router.get("/", requireAuth, getBugs)
router.post("/", requireAuth, createBug)

router.patch(
  "/:id/status",
  requireAuth,
  requireAdminByEmail,
  updateBugStatus
)

router.delete("/:id", requireAuth, deleteBug)

export default router
