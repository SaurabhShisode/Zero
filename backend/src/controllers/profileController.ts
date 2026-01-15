import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Solve } from "../models/Solve.js";
import { toDay } from "../utils/dates.js";

export const getHeatmap = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const solves = await Solve.find({
      user: req.userId,
      status: "solved",
    }).select("date");

    const counts: Record<string, number> = {};

    for (const solve of solves) {
      const day = toDay(solve.date).toISOString();
      counts[day] = (counts[day] ?? 0) + 1;
    }

    return res.json({ counts });
  } catch {
    return res.status(500).json({ message: "Failed to fetch heatmap" });
  }
};

export const publicProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const slug = req.params.slug as string | undefined;

    if (!slug) {
      return res.status(400).json({ message: "slug required" });
    }

    const user = await User.findOne({ profileSlug: slug }).select(
      "name profileSlug streak"
    );

    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }

    const recent = await Solve.find({
      user: user._id,
      status: "solved",
    })
      .sort({ date: -1 })
      .limit(30)
      .select("date");

    return res.json({ user, recent });
  } catch {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const addFriend = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { friendSlug } = req.body as { friendSlug?: string };

    if (!friendSlug) {
      return res.status(400).json({ message: "friendSlug required" });
    }

    const friend = await User.findOne({ profileSlug: friendSlug });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyAdded = user.friends.some((id) =>
      id.equals(friend._id)
    );

    if (!alreadyAdded) {
      user.friends.push(friend._id);
      await user.save();
    }

    return res.json({ friends: user.friends });
  } catch {
    return res.status(500).json({ message: "Failed to add friend" });
  }
};


export const compareWithFriend = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { friendId } = req.params as { friendId?: string };

    if (!friendId) {
      return res.status(400).json({ message: "friendId required" });
    }

    const me = await User.findById(req.userId).select("streak");
    const friend = await User.findById(friendId).select("streak");

    if (!me || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      you: { streak: me.streak },
      friend: { streak: friend.streak },
    });
  } catch {
    return res.status(500).json({ message: "Failed to compare users" });
  }
};
