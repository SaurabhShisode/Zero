import type { Request, Response } from "express";
import { Problem } from "../models/Problem.js";
import { Skills } from "../models/common.js";
import type { Difficulty } from "../models/common.js";
import { DiscussionComment } from "../models/Discussion.js";
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const createProblem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      title,
      link,
      skills,
      difficulty,
      companyTags = [],
      cooldownDays = 7
    } = req.body;

    if (!title || !link || !skills || !difficulty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "Skills must be a non-empty array" });
    }

    const invalidSkill = skills.find((s) => !Skills.includes(s));
    if (invalidSkill) {
      return res.status(400).json({ message: `Invalid skill: ${invalidSkill}` });
    }

    if (!DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" });
    }

    const problem = await Problem.create({
      title: String(title).trim(),
      link: String(link).trim(),
      skills,
      difficulty,
      companyTags,
      cooldownDays: Number(cooldownDays)
    });

    return res.status(201).json({ problem });
  } catch {
    return res.status(500).json({ message: "Failed to create problem" });
  }
};


export const listProblems = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const problems = await Problem.find()
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ problems });
  } catch {
    return res.status(500).json({ message: "Failed to fetch problems" });
  }
};

export const getProblemById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res.json({ problem });
  } catch {
    return res.status(500).json({ message: "Failed to load problem" });
  }
};

