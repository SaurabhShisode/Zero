import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { DiscussionComment } from "../models/Discussion.js";
import { Types } from "mongoose";

export const listProblemComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const rawId = req.params.problemId

    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "problemId required" })
    }

    if (!Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid problemId" })
    }

    const problemId = new Types.ObjectId(rawId)

    const page = Math.max(Number(req.query.page || 1), 1)
    const limit = Math.min(Number(req.query.limit || 50), 200)

    const comments = await DiscussionComment.find({ problem: problemId })
      .populate("user", "name profileSlug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return res.json({ comments, page, limit })
  } catch {
    return res.status(500).json({ message: "Failed to fetch comments" })
  }
}


export const addProblemComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawId = req.params.problemId;
    const message = String(req.body.message || "").trim();

    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "problemId required" });
    }

    if (!Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid problemId" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const comment = await DiscussionComment.create({
      problem: rawId,
      user: req.userId,
      message
    });

    await comment.populate("user", "name profileSlug");

    return res.status(201).json({ comment });
  } catch {
    return res.status(500).json({ message: "Failed to add comment" });
  }
};


export const deleteProblemComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId } = req.params;

    const comment = await DiscussionComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    await comment.deleteOne();

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};