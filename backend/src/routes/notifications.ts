import { Router } from "express";
import { getNotifications, getUnreadCount, markAllRead } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.post("/mark-read", requireAuth, markAllRead);

export default router;
