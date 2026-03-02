import { Types } from "mongoose";
import { SolvedProblem } from "../models/SolvedProblem.js";
import { Solve } from "../models/Solve.js";
import { RevisionTask } from "../models/RevisionTask.js";
import CommunityPost from "../models/CommunityPost.js";
import { User } from "../models/User.js";
import { Problem } from "../models/Problem.js";

export type BadgeId =
  | "first-solve"
  | "streak-7"
  | "streak-30"
  | "streak-100"
  | "streak-365"
  | "solved-10"
  | "solved-50"
  | "solved-100"
  | "solved-500"
  | "easy-master"
  | "medium-master"
  | "hard-master"
  | "reviewer"
  | "community-voice"
  | "multi-skill";

interface BadgeRule {
  id: BadgeId;
  check: (ctx: BadgeContext) => Promise<boolean>;
}

interface BadgeContext {
  userId: Types.ObjectId;
  currentStreak: number;
  maxStreak: number;
}

const RULES: BadgeRule[] = [
  {
    id: "first-solve",
    check: async (ctx) => {
      const count = await SolvedProblem.countDocuments({ user: ctx.userId });
      return count >= 1;
    },
  },
  {
    id: "solved-10",
    check: async (ctx) => {
      const count = await SolvedProblem.countDocuments({ user: ctx.userId });
      return count >= 10;
    },
  },
  {
    id: "solved-50",
    check: async (ctx) => {
      const count = await SolvedProblem.countDocuments({ user: ctx.userId });
      return count >= 50;
    },
  },
  {
    id: "solved-100",
    check: async (ctx) => {
      const count = await SolvedProblem.countDocuments({ user: ctx.userId });
      return count >= 100;
    },
  },
  {
    id: "solved-500",
    check: async (ctx) => {
      const count = await SolvedProblem.countDocuments({ user: ctx.userId });
      return count >= 500;
    },
  },
  {
    id: "streak-7",
    check: async (ctx) => ctx.maxStreak >= 7,
  },
  {
    id: "streak-30",
    check: async (ctx) => ctx.maxStreak >= 30,
  },
  {
    id: "streak-100",
    check: async (ctx) => ctx.maxStreak >= 100,
  },
  {
    id: "streak-365",
    check: async (ctx) => ctx.maxStreak >= 365,
  },
  {
    id: "easy-master",
    check: async (ctx) => {
      const easyProblems = await Problem.find({ difficulty: "Easy" }).select("_id");
      const easyIds = easyProblems.map((p) => p._id);
      if (easyIds.length === 0) return false;
      const solvedCount = await SolvedProblem.countDocuments({
        user: ctx.userId,
        problem: { $in: easyIds },
      });
      return solvedCount >= easyIds.length;
    },
  },
  {
    id: "medium-master",
    check: async (ctx) => {
      const medProblems = await Problem.find({ difficulty: "Medium" }).select("_id");
      const medIds = medProblems.map((p) => p._id);
      if (medIds.length === 0) return false;
      const solvedCount = await SolvedProblem.countDocuments({
        user: ctx.userId,
        problem: { $in: medIds },
      });
      return solvedCount >= medIds.length;
    },
  },
  {
    id: "hard-master",
    check: async (ctx) => {
      const hardProblems = await Problem.find({ difficulty: "Hard" }).select("_id");
      const hardIds = hardProblems.map((p) => p._id);
      if (hardIds.length === 0) return false;
      const solvedCount = await SolvedProblem.countDocuments({
        user: ctx.userId,
        problem: { $in: hardIds },
      });
      return solvedCount >= hardIds.length;
    },
  },
  {
    id: "reviewer",
    check: async (ctx) => {
      const doneCount = await RevisionTask.countDocuments({
        user: ctx.userId,
        status: "done",
      });
      return doneCount >= 10;
    },
  },
  {
    id: "community-voice",
    check: async (ctx) => {
      const postCount = await CommunityPost.countDocuments({
        author: ctx.userId,
      });
      return postCount >= 5;
    },
  },
  {
    id: "multi-skill",
    check: async (ctx) => {
      const solves = await Solve.find({
        user: ctx.userId,
        status: "solved",
      })
        .populate("problem", "skills")
        .select("problem");

      const skillSet = new Set<string>();
      for (const s of solves) {
        const prob = s.problem as any;
        if (prob?.skills) {
          for (const sk of prob.skills) {
            skillSet.add(sk);
          }
        }
      }
      return skillSet.size >= 5;
    },
  },
];

export async function checkAndAwardBadges(
  userId: Types.ObjectId,
  currentStreak: number,
  maxStreak: number
): Promise<string[]> {
  const user = await User.findById(userId).select("badges");
  if (!user) return [];

  const existingBadges = new Set(user.badges);
  const ctx: BadgeContext = { userId, currentStreak, maxStreak };
  const newBadges: string[] = [];

  for (const rule of RULES) {
    if (existingBadges.has(rule.id)) continue;

    try {
      const earned = await rule.check(ctx);
      if (earned) {
        newBadges.push(rule.id);
      }
    } catch {
    }
  }

  if (newBadges.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { badges: { $each: newBadges } } }
    );
  }

  return newBadges;
}
