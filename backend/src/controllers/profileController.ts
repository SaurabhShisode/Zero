import type { Request, Response } from "express"
import type { AuthRequest } from "../middleware/auth.js"
import { User } from "../models/User.js"
import { Solve } from "../models/Solve.js"
import { toDay } from "../utils/dates.js"
import { Problem } from "../models/Problem.js"
import mongoose from "mongoose"

type Difficulty = "Easy" | "Medium" | "Hard"

type PublicParams = {
  slug: string
}

export const publicProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const slug = req.params.slug as string | undefined

    if (!slug) {
      return res.status(400).json({ message: "slug required" })
    }

    const user = await User.findOne({ profileSlug: slug }).select(
      "name profileSlug streak"
    )

    if (!user) {
      return res.status(404).json({ message: "Not found" })
    }

    const recent = await Solve.find({
      user: user._id,
      status: "solved"
    })
      .sort({ solvedAt: -1 })
      .limit(30)
      .select("solvedAt date")

    return res.json({ user, recent })
  } catch {
    return res.status(500).json({ message: "Failed to fetch profile" })
  }
}

export const addFriend = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { friendSlug } = req.body as { friendSlug?: string }

    if (!friendSlug) {
      return res.status(400).json({ message: "friendSlug required" })
    }

    const friend = await User.findOne({ profileSlug: friendSlug })
    if (!friend) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (friend._id.equals(user._id)) {
      return res.status(400).json({ message: "You cannot add yourself" })
    }

    const userHasFriend = user.friends.some(id =>
      id.equals(friend._id)
    )

    const friendHasUser = friend.friends.some(id =>
      id.equals(user._id)
    )

    if (userHasFriend && friendHasUser) {
      return res.status(409).json({ message: "Already friends" })
    }

    if (!userHasFriend) {
      user.friends.push(friend._id)
    }

    if (!friendHasUser) {
      friend.friends.push(user._id)
    }

    await Promise.all([user.save(), friend.save()])

    return res.json({ message: "Friends added" })
  } catch {
    return res.status(500).json({ message: "Failed to add friend" })
  }
}


export const compareWithFriend = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { friendId } = req.params as { friendId?: string }

    if (!friendId) {
      return res.status(400).json({ message: "friendId required" })
    }

    const me = await User.findById(req.userId).select("streak")
    const friend = await User.findById(friendId).select("streak")

    if (!me || !friend) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({
      you: { streak: me.streak },
      friend: { streak: friend.streak }
    })
  } catch {
    return res.status(500).json({ message: "Failed to compare users" })
  }
}

export const getMyFriends = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(req.userId)
      .populate("friends", "name profileSlug")
      .select("friends")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ friends: user.friends })
  } catch {
    return res.status(500).json({ message: "Failed to fetch friends" })
  }
}

export const getProfileStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    const solvedAgg = await Solve.aggregate([
      {
        $match: {
          user: userObjectId,
          status: "solved"
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "problem",
          foreignField: "_id",
          as: "problemDoc"
        }
      },
      { $unwind: "$problemDoc" },
      {
        $group: {
          _id: "$problemDoc.difficulty",
          count: { $sum: 1 }
        }
      }
    ])

    const totalsAgg = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ])

    const solvedCount: Record<Difficulty, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    }

    const totalCount: Record<Difficulty, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    }

    for (const row of solvedAgg) {
      const diff = row._id as Difficulty

      if (diff === "Easy" || diff === "Medium" || diff === "Hard") {
        solvedCount[diff] = row.count
      }
    }

    for (const row of totalsAgg) {
      const diff = row._id as Difficulty

      if (diff === "Easy" || diff === "Medium" || diff === "Hard") {
        totalCount[diff] = row.count
      }
    }

    return res.json({
      stats: {
        easySolved: solvedCount.Easy,
        easyTotal: totalCount.Easy,
        mediumSolved: solvedCount.Medium,
        mediumTotal: totalCount.Medium,
        hardSolved: solvedCount.Hard,
        hardTotal: totalCount.Hard
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch stats" })
  }
}

export const getProfileHeatmap = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId)

    const today = new Date()
    today.setUTCHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setUTCFullYear(today.getUTCFullYear() - 1)
    startDate.setUTCHours(0, 0, 0, 0)

    const solvedAgg = await Solve.aggregate([
      {
        $match: {
          user: userObjectId,
          status: "solved",
          date: { $gte: startDate, $lte: today }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "Asia/Kolkata"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const heatmap = solvedAgg.map(row => ({
      date: row._id,
      count: row.count
    }))

    return res.json({ heatmap })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch heatmap" })
  }
}




export const getPublicProfileStats = async (
  req: Request<PublicParams>,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params


    const user = await User.findOne({ profileSlug: slug })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id)

    const solvedAgg = await Solve.aggregate([
      {
        $match: {
          user: userObjectId,
          status: "solved"
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "problem",
          foreignField: "_id",
          as: "problemDoc"
        }
      },
      { $unwind: "$problemDoc" },
      {
        $group: {
          _id: "$problemDoc.difficulty",
          count: { $sum: 1 }
        }
      }
    ])

    const totalsAgg = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 }
        }
      }
    ])

    const solvedCount: Record<Difficulty, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    }

    const totalCount: Record<Difficulty, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    }

    for (const row of solvedAgg) {
      const diff = row._id as Difficulty
      if (diff === "Easy" || diff === "Medium" || diff === "Hard") {
        solvedCount[diff] = row.count
      }
    }

    for (const row of totalsAgg) {
      const diff = row._id as Difficulty
      if (diff === "Easy" || diff === "Medium" || diff === "Hard") {
        totalCount[diff] = row.count
      }
    }

    return res.json({
      stats: {
        easySolved: solvedCount.Easy,
        easyTotal: totalCount.Easy,
        mediumSolved: solvedCount.Medium,
        mediumTotal: totalCount.Medium,
        hardSolved: solvedCount.Hard,
        hardTotal: totalCount.Hard
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch public stats" })
  }
}


export const getPublicProfileHeatmap = async (
  req: Request<PublicParams>,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params


    const user = await User.findOne({ profileSlug: slug })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id)

    const today = new Date()
    today.setUTCHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setUTCFullYear(today.getUTCFullYear() - 1)
    startDate.setUTCHours(0, 0, 0, 0)

    const solvedAgg = await Solve.aggregate([
      {
        $match: {
          user: userObjectId,
          status: "solved",
          date: { $gte: startDate, $lte: today }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "Asia/Kolkata"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const heatmap = solvedAgg.map(row => ({
      date: row._id,
      count: row.count
    }))

    return res.json({ heatmap })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch public heatmap" })
  }
}

export const getRecentSolves = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const solves = await Solve.find({
      user: req.userId,
      status: "solved"
    })
      .sort({ solvedAt: -1 })
      .limit(10)
      .populate("problem", "title difficulty")
      .select("solvedAt problem")

    const formatted = solves.map(s => ({
      solvedAt: s.solvedAt,
      problem: {
        _id: (s.problem as any)?._id,
        title: (s.problem as any)?.title || "Unknown",
        difficulty: (s.problem as any)?.difficulty || "Easy"
      }
    }))


    return res.json({ recent: formatted })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch recent solves" })
  }
}

export const removeFriend = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { friendId } = req.params as { friendId?: string }

    if (!friendId) {
      return res.status(400).json({ message: "friendId required" })
    }

    const me = await User.findById(req.userId)
    const friend = await User.findById(friendId)

    if (!me || !friend) {
      return res.status(404).json({ message: "User not found" })
    }

    me.friends = me.friends.filter(id => !id.equals(friend._id))
    friend.friends = friend.friends.filter(id => !id.equals(me._id))

    await Promise.all([me.save(), friend.save()])

    return res.json({ message: "Friend removed", friends: me.friends })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to remove friend" })
  }
}
export const getPublicRecentSolves = async (
  req: Request<PublicParams>,
  res: Response
): Promise<Response> => {
  try {
    const { slug } = req.params

    const user = await User.findOne({ profileSlug: slug })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const solves = await Solve.find({
      user: user._id,
      status: "solved"
    })
      .sort({ solvedAt: -1 })
      .limit(10)
      .populate("problem", "title difficulty")
      .select("solvedAt problem")

    const formatted = solves.map(s => ({
      solvedAt: s.solvedAt,
      problem: {
        _id: (s.problem as any)?._id,
        title: (s.problem as any)?.title || "Unknown",
        difficulty: (s.problem as any)?.difficulty || "Easy"
      }
    }))

    return res.json({ recent: formatted })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Failed to fetch public recent solves" })
  }
}
