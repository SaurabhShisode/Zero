import { addDays } from "date-fns";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import { Solve } from "../models/Solve.js";
import { RevisionTask } from "../models/RevisionTask.js";
import { toDay } from "../utils/dates.js";
import { User } from "../models/User.js";

export const markSolve = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { problemId, status, approachNote, placementMode } = req.body;

    if (!problemId || !status) {
      return res.status(400).json({ message: "problemId and status required" });
    }

    const userId = new Types.ObjectId(req.userId);
    const problemObjectId = new Types.ObjectId(problemId);
    const date = toDay();

    if (status === "solved") {
      if (typeof approachNote !== "string" || approachNote.trim().length < 10) {
        return res.status(400).json({
          message: "Approach note required (min 10 chars) before marking as solved",
        });
      }
    }

    const solve = await Solve.findOneAndUpdate(
      { user: userId, problem: problemObjectId, date },
      {
        status,
        approachNote,
        placementMode: placementMode === true,
      },
      { upsert: true, new: true }
    );

    if (status === "wrong" || status === "skipped") {
      const offsets = [3, 7, 14];

      for (const offset of offsets) {
        const scheduledFor = toDay(addDays(date, offset));

        await RevisionTask.updateOne(
          {
            user: userId,
            problem: problemObjectId,
            scheduledFor,
          },
          { $setOnInsert: { status: "pending" } },
          { upsert: true }
        );
      }
    }

    if (status === "solved" && solve) {
      const user = await User.findById(userId);
      if (user) {
        const yesterday = toDay(addDays(date, -1));

        const hadYesterdaySolve = await Solve.exists({
          user: userId,
          status: "solved",
          date: yesterday,
        });

        user.streak.current = hadYesterdaySolve
          ? user.streak.current + 1
          : 1;

        user.streak.max = Math.max(
          user.streak.max,
          user.streak.current
        );

        await user.save();

        try {
          const { awardBadges } = await import("../services/badges.js");
          await awardBadges(user);
        } catch {
        }
      }
    }

    return res.json({ solve });
  } catch {
    return res.status(500).json({ message: "Failed to mark solve" });
  }
};
