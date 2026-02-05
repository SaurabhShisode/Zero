import type { Request, Response } from "express"
import mongoose from "mongoose"
import CommunityPost from "../models/CommunityPost.js"
import CommunityComment from "../models/CommunityComment.js"
import { parsePagination, buildMeta } from "../utils/paginate.js"

function getId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null
  return new mongoose.Types.ObjectId(value)
}

export async function getPosts(req: Request, res: Response) {
  try {
    const sort = String(req.query.sort || "trending")

    const userId = (req as any).userId
      ? new mongoose.Types.ObjectId((req as any).userId)
      : null

    const pipeline: any[] = [
      {
        $addFields: {
          upvotesCount: {
            $size: { $ifNull: ["$upvotes", []] }
          },
          downvotesCount: {
            $size: { $ifNull: ["$downvotes", []] }
          },
          engagementScore: {
            $add: [
              { $ifNull: ["$commentsCount", 0] },
              { $size: { $ifNull: ["$upvotes", []] } },
              { $size: { $ifNull: ["$downvotes", []] } }
            ]
          },
          voteScore: {
            $subtract: [
              { $size: { $ifNull: ["$upvotes", []] } },
              { $size: { $ifNull: ["$downvotes", []] } }
            ]
          }
        }
      }
    ]

    if (sort === "top") {
      pipeline.push({ $sort: { voteScore: -1, createdAt: -1 } })
    } else if (sort === "new") {
      pipeline.push({ $sort: { createdAt: -1 } })
    } else {
      pipeline.push({ $sort: { engagementScore: -1, createdAt: -1 } })
    }

    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>, { page: 1, limit: 20 })
    const total = await CommunityPost.countDocuments()

    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author"
      }
    })

    pipeline.push({
      $unwind: "$author"
    })

    pipeline.push({
      $project: {
        title: 1,
        body: 1,
        tags: 1,
        commentsCount: { $ifNull: ["$commentsCount", 0] },
        upvotes: "$upvotesCount",
        downvotes: "$downvotesCount",
        voteScore: 1,
        engagementScore: 1,
        createdAt: 1,
        author: {
          name: "$author.name",
          profileSlug: "$author.profileSlug"
        },
        upvotesArr: "$upvotes",
        downvotesArr: "$downvotes"
      }
    })

    const posts = await CommunityPost.aggregate(pipeline)

    const formattedPosts = posts.map((p: any) => {
      let myVote: "up" | "down" | null = null

      if (userId) {
        if (p.upvotesArr?.some((u: any) => u.toString() === userId.toString())) {
          myVote = "up"
        }
        if (p.downvotesArr?.some((u: any) => u.toString() === userId.toString())) {
          myVote = "down"
        }
      }

      return {
        _id: p._id,
        title: p.title,
        body: p.body,
        tags: p.tags || [],
        commentsCount: p.commentsCount,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        myVote,
        author: p.author,
        createdAt: p.createdAt
      }
    })

    res.json({ posts: formattedPosts, pagination: buildMeta(page, limit, total) })
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

    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>, { page: 1, limit: 30 })

    const [comments, total] = await Promise.all([
      CommunityComment.find({ post: postId })
        .populate("author", "_id name profileSlug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CommunityComment.countDocuments({ post: postId })
    ])

    res.json({ comments, pagination: buildMeta(page, limit, total) })
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
export async function deletePost(req: Request, res: Response) {
  try {
    const postId = getId(req.params.id)
    const userId = (req as any).userId

    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" })
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)

    const post = await CommunityPost.findById(postId)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (!post.author.equals(userObjectId)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await CommunityComment.deleteMany({ post: post._id })
    await post.deleteOne()

    res.json({ success: true })
  } catch (err) {
    console.error("Delete post error:", err)
    res.status(500).json({ message: "Failed to delete post" })
  }
}
