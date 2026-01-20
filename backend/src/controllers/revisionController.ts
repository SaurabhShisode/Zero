import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { RevisionTask } from "../models/RevisionTask.js";
import { Types } from "mongoose";
import { toDay } from "../utils/dates.js";

export const getPendingRevisions = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new Types.ObjectId(req.userId);
    const today = toDay()
    const tasks = await RevisionTask.find({
      user: userId,
      status: "pending",
      scheduledFor: { $lte: today }
    }).populate("problem")

    return res.json({ tasks });
  } catch {
    return res.status(500).json({ message: "Failed to fetch revisions" });
  }
};

export const markRevisionDone = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "id required" });
    }

    const task = await RevisionTask.findOne({
      _id: id,
      user: new Types.ObjectId(req.userId),
    });

    if (!task) {
      return res.status(404).json({ message: "Not found" });
    }

    task.status = "done";
    await task.save();

    return res.json({ task });
  } catch {
    return res.status(500).json({ message: "Failed to update revision" });
  }
};
