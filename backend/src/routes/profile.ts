import { Router } from "express";
import { getHeatmap, publicProfile, addFriend, compareWithFriend, getMyFriends } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/heatmap", requireAuth, getHeatmap);
router.get("/public/:slug", publicProfile);
router.post("/friends", requireAuth, addFriend);
router.get("/compare/:friendId", requireAuth, compareWithFriend);
router.get("/friends", requireAuth, getMyFriends)

export default router;

