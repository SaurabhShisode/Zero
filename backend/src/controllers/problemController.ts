import type { Request, Response } from "express";
import { Problem } from "../models/Problem.js";
import { Skills } from "../models/common.js";
import type { AuthRequest } from "../middleware/auth.js"
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

export const getProblemsByCompany = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const tag = String(req.params.tag || "").toLowerCase()

    const allowed = ["faang", "service", "startup", "any"]

    if (!allowed.includes(tag)) {
      return res.status(400).json({ message: "Invalid company tag" })
    }

    const query =
      tag === "any"
        ? {}
        : {
            companyTags: {
              $in: [tag]
            }
          }

    const problems = await Problem.find(query)
      .select("title link difficulty skills companyTags")
      .sort({ difficulty: 1, title: 1 })
      .limit(200)

    return res.json({ problems })
  } catch {
    return res
      .status(500)
      .json({ message: "Failed to fetch company problems" })
  }
}
const SKILL_MAP: Record<string, string> = {
  dsa: "DSA",
  sql: "SQL",
  javascript: "JavaScript",
  java: "Java",
  systemdesign: "SystemDesign",
  operatingsystems: "OperatingSystems",
  dbms: "DBMS",
  networking: "Networking",
  aptitude: "Aptitude",
  behavioral: "Behavioral"
}
export const getProblemsBySkill = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const raw = String(req.params.skill || "").toLowerCase()

    const dbSkill = SKILL_MAP[raw]

    if (!dbSkill) {
      return res.status(400).json({ message: "Invalid skill" })
    }

    const problems = await Problem.find({
      skills: dbSkill
    })
      .select("title link difficulty skills companyTags")
      .sort({ difficulty: 1, title: 1 })
      .limit(300)

    return res.json({ problems })
  } catch {
    return res.status(500).json({ message: "Failed to fetch skill problems" })
  }
}

// Advanced filtering with multiple criteria
export const filterProblems = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const {
      skills = [],
      difficulties = [],
      companyTags = [],
      search = "",
      page = 1,
      limit = 20
    } = req.query;

    const query: any = {};

    // Filter by skills
    if (Array.isArray(skills) && skills.length > 0) {
      query.skills = { $in: skills };
    } else if (typeof skills === "string" && skills) {
      query.skills = { $in: [skills] };
    }

    // Filter by difficulties
    if (Array.isArray(difficulties) && difficulties.length > 0) {
      query.difficulty = { $in: difficulties };
    } else if (typeof difficulties === "string" && difficulties) {
      query.difficulty = { $in: [difficulties] };
    }

    // Filter by company tags
    if (Array.isArray(companyTags) && companyTags.length > 0) {
      query.companyTags = { $in: companyTags };
    } else if (typeof companyTags === "string" && companyTags) {
      query.companyTags = { $in: [companyTags] };
    }

    // Full-text search
    if (typeof search === "string" && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select("title link difficulty skills companyTags")
        .sort({ difficulty: 1, title: 1 })
        .skip(skip)
        .limit(limitNum),
      Problem.countDocuments(query)
    ]);

    return res.json({
      problems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to filter problems" });
  }
};

// Search problems by title or skill
export const searchProblems = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { q = "", limit = 10 } = req.query;

    if (typeof q !== "string" || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit)) || 10));

    const problems = await Problem.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { companyTags: { $regex: q, $options: "i" } }
      ]
    })
      .select("title link difficulty skills companyTags")
      .limit(limitNum);

    return res.json({ problems });
  } catch {
    return res.status(500).json({ message: "Failed to search problems" });
  }
};
