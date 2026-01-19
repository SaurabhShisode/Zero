import type { Request, Response } from "express"
import mongoose from "mongoose"
import CommunityPost from "../models/CommunityPost.js"
import CommunityComment from "../models/CommunityComment.js"

function getId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null
  return new mongoose.Types.ObjectId(value)
}

export async function getPosts(req: Request, res: Response) {
  try {
    const sort = String(req.query.sort || "trending")

    let sortQuery: any = { updatedAt: -1 }
    if (sort === "top") sortQuery = { commentsCount: -1 }
    if (sort === "new") sortQuery = { createdAt: -1 }

    const userId = (req as any).userId
      ? new mongoose.Types.ObjectId((req as any).userId)
      : null

    const posts = await CommunityPost.find()
      .populate("author", "name profileSlug")
      .sort(sortQuery)
      .limit(50)
      .lean()

    const formattedPosts = posts.map((p: any) => {
      const upvotes = Array.isArray(p.upvotes) ? p.upvotes : []
      const downvotes = Array.isArray(p.downvotes) ? p.downvotes : []

      let myVote: "up" | "down" | null = null

      if (userId) {
        if (upvotes.some((u: any) => u.toString() === userId.toString())) {
          myVote = "up"
        }
        if (downvotes.some((u: any) => u.toString() === userId.toString())) {
          myVote = "down"
        }
      }

      return {
        _id: p._id,
        title: p.title,
        body: p.body,
        tags: p.tags || [],
        commentsCount: p.commentsCount || 0,
        upvotes: upvotes.length,
        downvotes: downvotes.length,
        myVote,
        author: p.author,
        createdAt: p.createdAt
      }
    })

    res.json({ posts: formattedPosts })
  } catch (err) {
    console.error("Get posts error:", err)
    res.status(500).json({ message: "Failed to fetch posts" })
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { title, body, tags } = req.body
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (typeof title !== "string" || typeof body !== "string") {
      return res.status(400).json({ message: "Title and body are required" })
    }

    const post = await CommunityPost.create({
      title: title.trim(),
      body: body.trim(),
      tags: Array.isArray(tags) ? tags : [],
      author: new mongoose.Types.ObjectId(userId)
    })

    const populated = await post.populate("author", "name profileSlug")

    res.status(201).json({ post: populated })
  } catch (err) {
    console.error("Create post error:", err)
    res.status(500).json({ message: "Failed to create post" })
  }
}

export async function votePost(req: Request, res: Response) {
  try {
    const postId = getId(req.params.id)
    const { type } = req.body
    const userId = (req as any).userId

    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" })
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (type !== "up" && type !== "down") {
      return res.status(400).json({ message: "Invalid vote type" })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)

    const post = await CommunityPost.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const hasUpvoted = post.upvotes.some(u => u.equals(userObjectId))
    const hasDownvoted = post.downvotes.some(u => u.equals(userObjectId))

    post.upvotes = post.upvotes.filter(u => !u.equals(userObjectId))
    post.downvotes = post.downvotes.filter(u => !u.equals(userObjectId))

    let myVote: "up" | "down" | null = null

    if (type === "up" && !hasUpvoted) {
      post.upvotes.push(userObjectId)
      myVote = "up"
    }

    if (type === "down" && !hasDownvoted) {
      post.downvotes.push(userObjectId)
      myVote = "down"
    }

    await post.save()

    res.json({
      success: true,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      myVote
    })
  } catch (err) {
    console.error("Vote error:", err)
    res.status(500).json({ message: "Failed to vote" })
  }
}

export async function getComments(req: Request, res: Response) {
  try {
    const postId = getId(req.params.id)

    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" })
    }

    const comments = await CommunityComment.find({ post: postId })
      .populate("author", "_id name profileSlug")

      .sort({ createdAt: -1 })

    res.json({ comments })
  } catch (err) {
    console.error("Get comments error:", err)
    res.status(500).json({ message: "Failed to fetch comments" })
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const postId = getId(req.params.id)
    const { message } = req.body
    const userId = (req as any).userId

    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" })
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" })
    }

    const comment = await CommunityComment.create({
      post: postId,
      message: message.trim(),
      author: new mongoose.Types.ObjectId(userId)
    })

    await CommunityPost.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    })

    const populated = await comment.populate("author", "_id name profileSlug")

    res.status(201).json({ comment: populated })
  } catch (err) {
    console.error("Add comment error:", err)
    res.status(500).json({ message: "Failed to add comment" })
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const commentId = getId(req.params.id)
    const userId = (req as any).userId

    if (!commentId) {
      return res.status(400).json({ message: "Invalid comment id" })
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)

    const comment = await CommunityComment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (!comment.author.equals(userObjectId)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await comment.deleteOne()

    await CommunityPost.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    })

    res.json({ success: true })
  } catch (err) {
    console.error("Delete comment error:", err)
    res.status(500).json({ message: "Failed to delete comment" })
  }
}
