import { Router } from "express";
import {
  getBookmarks,
  toggleBookmark,
  bookmarkToCollection,
  addToGroupCollection,
  isBookmarked,
  getBookmarksByCollection,
  getCollections,
  updateBookmark,
  getBookmarksByTag,
  getAllTags
} from "../controllers/bookmarkController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getBookmarks);
router.post("/toggle", requireAuth, toggleBookmark);
router.post("/to-collection", requireAuth, bookmarkToCollection);
router.post("/add-to-group-collection", requireAuth, addToGroupCollection);
router.get("/check/:problemId", requireAuth, isBookmarked);

// Collections
router.get("/collections/list", requireAuth, getCollections);
router.get("/collection/:collection", requireAuth, getBookmarksByCollection);

// Tags
router.get("/tags/list", requireAuth, getAllTags);
router.get("/tag/:tag", requireAuth, getBookmarksByTag);

// Update bookmark
router.put("/:id", requireAuth, updateBookmark);

export default router;
