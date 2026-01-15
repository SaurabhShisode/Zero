import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Skills } from "../models/common.js";
import type { Difficulty } from "../models/common.js";

type PreferenceInput = {
  skill: string;
  enabled: boolean;
  difficulty: Difficulty;
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const updatePreferences = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { preferences, placementMode } = req.body as {
      preferences?: PreferenceInput[];
      placementMode?: boolean;
    };

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: "Invalid preferences payload" });
    }

    for (const pref of preferences) {
      if (
        !Skills.includes(pref.skill as (typeof Skills)[number]) ||
        typeof pref.enabled !== "boolean" ||
        !DIFFICULTIES.includes(pref.difficulty)
      ) {
        return res.status(400).json({ message: "Invalid preference values" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        preferences,
        placementMode: placementMode === true,
      },
      { new: true, select: "-passwordHash" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Failed to update preferences" });
  }
};
