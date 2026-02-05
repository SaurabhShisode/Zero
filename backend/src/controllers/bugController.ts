import type { Request, Response } from "express"
import mongoose from "mongoose"
import Bug from "../models/Bug.js"
import { parsePagination, buildMeta } from "../utils/paginate.js"

function toObjectId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null
  return new mongoose.Types.ObjectId(value)
}


const VALID_STATUSES = ["open", "in_progress", "fixed"] as const

type BugStatus = typeof VALID_STATUSES[number]



export async function updateBugStatus(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { status } = req.body as { status: BugStatus }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      })
    }

    const bugId = toObjectId(id)

    if (!bugId) {
      return res.status(400).json({
        message: "Invalid bug id"
      })
    }

    const bug = await Bug.findById(bugId)

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      })
    }

    bug.status = status
    await bug.save()

    await bug.populate("author", "name profileSlug")

    return res.json({
      message: "Bug status updated",
      bug
    })
  } catch (err) {
    console.error("Update bug status error:", err)
    return res.status(500).json({
      message: "Failed to update bug status"
    })
  }
}

export async function createBug(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const authorId = toObjectId(userId)

    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { title, description, severity } = req.body

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      })
    }

    const bug = await Bug.create({
      title,
      description,
      severity,
      author: authorId
    })

    await bug.populate("author", "name profileSlug")

    res.status(201).json({ bug })
  } catch (err) {
    console.error("Create bug error:", err)
    res.status(500).json({ message: "Failed to create bug" })
  }
}

export async function getBugs(req: Request, res: Response) {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>, { page: 1, limit: 20 })

    const [bugs, total] = await Promise.all([
      Bug.find()
        .populate("author", "name profileSlug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bug.countDocuments()
    ])

    res.json({ bugs, pagination: buildMeta(page, limit, total) })
  } catch (err) {
    console.error("Get bugs error:", err)
    res.status(500).json({ message: "Failed to fetch bugs" })
  }
}

export async function deleteBug(req: Request, res: Response) {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const bugId = toObjectId(id)

    if (!bugId) {
      return res.status(400).json({ message: "Invalid bug id" })
    }

    const bug = await Bug.findById(bugId)

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" })
    }

    if (bug.author.toString() !== String(userId)) {
      return res.status(403).json({ message: "Not allowed" })
    }

    await bug.deleteOne()

    res.json({ message: "Bug deleted" })
  } catch (err) {
    console.error("Delete bug error:", err)
    res.status(500).json({ message: "Failed to delete bug" })
  }
}
