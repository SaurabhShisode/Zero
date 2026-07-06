import { Router } from "express";
import {
  getSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter
} from "../controllers/filterController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getSavedFilters);
router.post("/", requireAuth, createSavedFilter);
router.put("/:id", requireAuth, updateSavedFilter);
router.delete("/:id", requireAuth, deleteSavedFilter);

export default router;
