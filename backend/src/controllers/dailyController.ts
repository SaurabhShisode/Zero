import type { Response } from "express";
import { DailyProblem } from "../models/DailyProblem.js";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";
import { toDay } from "../utils/dates.js";

export const getDaily = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enabledSkills = user.preferences
      .filter((pref) => pref.enabled)
      .map((pref) => pref.skill);

    if (enabledSkills.length === 0) {
      return res.json({ daily: [] });
    }

    const today = toDay();

    const daily = await DailyProblem.find({
      date: today,
      skill: { $in: enabledSkills },
    })
      .populate("problem")
      .sort({ skill: 1 });

    return res.json({ daily });
  } catch {
    return res.status(500).json({ message: "Failed to fetch daily problems" });
  }
};
