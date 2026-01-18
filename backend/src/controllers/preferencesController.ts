import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Skills } from "../models/common.js";
import type { Difficulty, Skill } from "../models/common.js";

type PreferenceInput = {
  skill: Skill;
  enabled: boolean;
  difficulty: Difficulty;
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const PLACEMENT_MODE_SKILLS: Skill[] = [
  "DSA",
  "Aptitude",
  "Behavioral",
  "SystemDesign",
  "OperatingSystems",
  "DBMS",
  "Networking"
];

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
        !Skills.includes(pref.skill) ||
        typeof pref.enabled !== "boolean" ||
        !DIFFICULTIES.includes(pref.difficulty)
      ) {
        return res.status(400).json({ message: "Invalid preference values" });
      }
    }

    let finalPreferences = preferences;

    if (placementMode === true) {
      finalPreferences = preferences.map((pref) => {
        if (PLACEMENT_MODE_SKILLS.includes(pref.skill)) {
          return {
            ...pref,
            enabled: true
          };
        }
        return pref;
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        preferences: finalPreferences,
        placementMode: placementMode === true
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

export const getPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findById(req.userId).select(
      "preferences placementMode"
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.json({ user })
  } catch {
    return res.status(500).json({ message: "Failed to fetch preferences" })
  }
}
