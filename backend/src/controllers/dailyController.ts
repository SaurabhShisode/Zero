import type { Response } from "express"
import { DailyProblem } from "../models/DailyProblem.js"
import { User } from "../models/User.js"
import { Solve } from "../models/Solve.js"
import type { AuthRequest } from "../middleware/auth.js"
import { toDay } from "../utils/dates.js"
import { Types } from "mongoose"
export const getDaily = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const enabledSkills = user.preferences
      .filter((pref) => pref.enabled)
      .map((pref) => pref.skill)

    if (enabledSkills.length === 0) {
      return res.json({ daily: [] })
    }

    const today = toDay()

    const dailyProblems = await DailyProblem.find({
      date: today,
      skill: { $in: enabledSkills }
    })
      .populate("problem")
      .sort({ skill: 1 })

    const solves = await Solve.find({
      user: req.userId,
      date: today
    }).select("problem status")

    const solveMap = new Map<string, string>()
    solves.forEach((s) => {
      solveMap.set(s.problem.toString(), s.status)
    })

    const daily = dailyProblems.map((dp) => {
      const obj = dp.toObject()
      const problemId = obj.problem._id.toString()

      return {
        ...obj,
        solveStatus: solveMap.get(problemId) || null
      }
    })

    return res.json({ daily })
  } catch {
    return res.status(500).json({ message: "Failed to fetch daily problems" })
  }
}
export const getProblemHistory = async (
  req: AuthRequest,
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

    const history = await DailyProblem.find({
      problem: rawId
    })
      .select("date skill")
      .sort({ date: -1 })

    return res.json({ history })
  } catch {
    return res.status(500).json({ message: "Failed to fetch problem history" })
  }
}