import { Router } from "express"
import {
  publicProfile,
  addFriend,
  compareWithFriend,
  getMyFriends,
  getProfileStats,
  getProfileHeatmap,
  getPublicProfileStats,
  getPublicProfileHeatmap
} from "../controllers/profileController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()


router.get("/public/:slug", publicProfile)
router.get("/public/:slug/stats", getPublicProfileStats)
router.get("/public/:slug/heatmap", getPublicProfileHeatmap)


router.get("/stats", requireAuth, getProfileStats)
router.get("/heatmap", requireAuth, getProfileHeatmap)
router.get("/friends", requireAuth, getMyFriends)
router.post("/friends", requireAuth, addFriend)
router.get("/compare/:friendId", requireAuth, compareWithFriend)

export default router
