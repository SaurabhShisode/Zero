import { Router } from "express"
import {
  getPosts,
  createPost,
  votePost,
  getComments,
  addComment,
  deleteComment
} from "../controllers/communityController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.get("/posts", getPosts)
router.post("/posts", requireAuth, createPost)

router.post("/posts/:id/vote", requireAuth, votePost)

router.get("/posts/:id/comments", getComments)
router.post("/posts/:id/comments", requireAuth, addComment)
router.delete("/comments/:id", requireAuth, deleteComment)

export default router
