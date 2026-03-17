import { Router } from "express";
import { getBookmarks, toggleBookmark, isBookmarked } from "../controllers/bookmarkController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getBookmarks);
router.post("/toggle", requireAuth, toggleBookmark);
router.get("/:problemId", requireAuth, isBookmarked);

export default router;
