import { addDays } from "date-fns";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import mongoose, { Types } from "mongoose";
import { Solve } from "../models/Solve.js";
import { SolvedProblem } from "../models/SolvedProblem.js";
import { RevisionTask } from "../models/RevisionTask.js";
import { toDay } from "../utils/dates.js";
import { User } from "../models/User.js";


export const markSolve = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const session = await mongoose.startSession()

  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { problemId, status, approachNote, placementMode } = req.body

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

    function dayRange(d: Date) {
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)

      const end = new Date(d)
      end.setHours(23, 59, 59, 999)

      return { start, end }
    }

    session.startTransaction()

  
    const solve = await Solve.findOneAndUpdate(
      { user: userId, problem: problemObjectId, date },
      {
        status,
        approachNote,
        placementMode: placementMode === true
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
    }

 
    if (status === "solved") {
      const user = await User.findById(userId).session(session)
      if (!user) {
        await session.commitTransaction()
        session.endSession()
        return res.json({ solve })
      }

      const todayRange = dayRange(date)

      const hadTodaySolve = await SolvedProblem.exists({
        user: userId,
        solvedAt: { $gte: todayRange.start, $lte: todayRange.end }
      }).session(session)

      if (!hadTodaySolve) {
        const yesterday = addDays(date, -1)
        const yRange = dayRange(yesterday)

        const hadYesterdaySolve = await SolvedProblem.exists({
          user: userId,
          solvedAt: { $gte: yRange.start, $lte: yRange.end }
        }).session(session)

        user.streak.current = hadYesterdaySolve
          ? user.streak.current + 1
          : 1

        user.streak.max = Math.max(
          user.streak.max,
          user.streak.current
        )

        await user.save({ session })
      }
    }

    await session.commitTransaction()
    session.endSession()

    return res.json({ solve })
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