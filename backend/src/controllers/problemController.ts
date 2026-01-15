import type { Request, Response } from "express";
import { Problem } from "../models/Problem.js";
import { Skills } from "../models/common.js";
import type { Difficulty } from "../models/common.js";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const createProblem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      title,
      link,
      skill,
      difficulty,
      companyTags = [],
      cooldownDays = 7,
    } = req.body;

    if (!title || !link || !skill || !difficulty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Skills.includes(skill)) {
      return res.status(400).json({ message: "Invalid skill" });
    }

    if (!DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" });
    }

    const problem = await Problem.create({
      title: String(title).trim(),
      link: String(link).trim(),
      skill,
      difficulty,
      companyTags,
      cooldownDays: Number(cooldownDays),
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
