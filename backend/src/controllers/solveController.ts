import { addDays } from "date-fns";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import mongoose, { Types } from "mongoose";
import { Solve } from "../models/Solve.js";
import { SolvedProblem } from "../models/SolvedProblem.js";
import { RevisionTask } from "../models/RevisionTask.js";
import { toDay } from "../utils/dates.js";
import { User } from "../models/User.js";
import { checkAndAwardBadges } from "../services/badges.js";
import { createNotification } from "./notificationController.js";


export const markSolve = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const session = await mongoose.startSession()

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { problemId, status, approachNote, placementMode, startedAt, interviewMode } = req.body

    if (!problemId || !status) {
      return res.status(400).json({ message: "problemId and status required" })
    }

    const userId = new Types.ObjectId(req.userId)
    const problemObjectId = new Types.ObjectId(problemId)
    const date = toDay()

    if (status === "solved") {
      if (typeof approachNote !== "string" || approachNote.trim().length < 10) {
        return res.status(400).json({
          message: "Approach note required (min 10 chars) before marking as solved"
        })
      }
    }

    // Calculate time spent if startedAt is provided
    let timeSpent: number | undefined;
    let solvedWithinTime: boolean | undefined;
    if (startedAt && typeof startedAt === "string") {
      const startTime = new Date(startedAt);
      const endTime = new Date();
      timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
      
      // If interview mode, check if solved within 45 minutes
      if (interviewMode) {
        solvedWithinTime = timeSpent <= 2700; // 45 minutes in seconds
      }
    }

    session.startTransaction()

    const solve = await Solve.findOneAndUpdate(
      { user: userId, problem: problemObjectId, date },
      {
        status,
        approachNote,
        placementMode: placementMode === true,
        solvedAt: new Date(),
        ...(startedAt && { startedAt: new Date(startedAt) }),
        ...(timeSpent && { timeSpent }),
        ...(interviewMode && { interviewMode }),
        ...(solvedWithinTime !== undefined && { solvedWithinTime })
      },
      { upsert: true, new: true, session }
    )

    if (status === "solved") {
      await SolvedProblem.findOneAndUpdate(
        { user: userId, problem: problemObjectId },
        { solvedAt: new Date() },
        { upsert: true, new: true, session }
      )
    } else {
      await SolvedProblem.deleteOne(
        { user: userId, problem: problemObjectId },
        { session }
      )
    }


    if (status === "wrong" || status === "skipped") {
      const offsets = [3, 7, 14]

      for (const offset of offsets) {
        const scheduledFor = toDay(addDays(date, offset))

        await RevisionTask.updateOne(
          {
            user: userId,
            problem: problemObjectId,
            scheduledFor
          },
          { $setOnInsert: { status: "pending" } },
          { upsert: true, session }
        )
      }

      await createNotification(userId, "revision", "Revision tasks scheduled", "3 revision sessions queued at day 3, 7, and 14.")
    }

    let newBadges: string[] = []

    if (status === "solved") {
      const user = await User.findById(userId).session(session)
      if (!user) {
        await session.commitTransaction()
        session.endSession()
        return res.json({ solve, newBadges })
      }


      const todayStr = date.toISOString().slice(0, 10)
      const lastActivityStr = user.streak.lastActivityDate
        ? new Date(user.streak.lastActivityDate).toISOString().slice(0, 10)
        : null


      if (lastActivityStr !== todayStr) {
        const yesterday = addDays(date, -1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)

        if (lastActivityStr === yesterdayStr) {

          user.streak.current += 1
        } else {

          user.streak.current = 1
        }

        user.streak.max = Math.max(user.streak.max, user.streak.current)
        user.streak.lastActivityDate = date

        await user.save({ session })
      }

      await session.commitTransaction()
      session.endSession()

      try {
        newBadges = await checkAndAwardBadges(
          userId,
          user.streak.current,
          user.streak.max
        )
        for (const badge of newBadges) {
          await createNotification(userId, "badge", `Badge unlocked: ${badge}`, "Keep going!")
        }
        const MILESTONES = [7, 14, 30, 50, 100, 200, 365]
        if (MILESTONES.includes(user.streak.current)) {
          await createNotification(userId, "streak", `${user.streak.current}-day streak!`, "You're on fire!")
        }
      } catch { }

      return res.json({ solve, newBadges })
    }

    await session.commitTransaction()
    session.endSession()

    return res.json({ solve, newBadges })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    console.error(err)
    return res.status(500).json({ message: "Failed to mark solve" })
  }
}


export const isSolved = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawId = req.params.problemId;

    if (!rawId || typeof rawId !== "string") {
      return res.status(400).json({ message: "problemId required" });
    }

    if (!Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid problemId" });
    }

    const exists = await SolvedProblem.exists({
      user: new Types.ObjectId(req.userId),
      problem: new Types.ObjectId(rawId)
    });

    return res.json({ solved: Boolean(exists) });
  } catch {
    return res.status(500).json({ message: "Failed to check solved state" });
  }
};