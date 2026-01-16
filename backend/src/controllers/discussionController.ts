import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { DiscussionComment } from "../models/Discussion.js";
import { DailyProblem } from "../models/DailyProblem.js";

export const listProblemComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const problemId = req.params.problemId;
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    if (!problemId) {
      return res.status(400).json({ message: "problemId required" });
    }

    const comments = await DiscussionComment.find({ problem: problemId })
      .populate("user", "name profileSlug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ comments, page, limit });
  } catch {
    return res.status(500).json({ message: "Failed to fetch problem comments" });
  }
};

export const listDailyComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dailyProblemId = req.params.dailyProblemId;
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    if (!dailyProblemId) {
      return res.status(400).json({ message: "dailyProblemId required" });
    }

    const comments = await DiscussionComment.find({
      dailyProblem: dailyProblemId
    })
      .populate("user", "name profileSlug")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ comments, page, limit });
  } catch {
    return res.status(500).json({ message: "Failed to fetch daily comments" });
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dailyProblemId = req.params.dailyProblemId;
    const message = String(req.body.message || "").trim();

    if (!dailyProblemId) {
      return res.status(400).json({ message: "dailyProblemId required" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const daily = await DailyProblem.findById(dailyProblemId);

    if (!daily) {
      return res.status(404).json({ message: "Daily problem not found" });
    }

    const comment = await DiscussionComment.create({
      problem: daily.problem,
      dailyProblem: daily._id,
      user: req.userId,
      message
    });

    await comment.populate("user", "name profileSlug");

    return res.status(201).json({ comment });
  } catch {
    return res.status(500).json({ message: "Failed to add comment" });
  }
};
