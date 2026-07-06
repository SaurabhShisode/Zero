import { Types } from "mongoose";
import { Solve } from "../models/Solve.js";
import { Problem } from "../models/Problem.js";
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";

export interface SkillStats {
  skill: string;
  easy: { solved: number; total: number; rate: number };
  medium: { solved: number; total: number; rate: number };
  hard: { solved: number; total: number; rate: number };
  totalSolved: number;
  totalAttempts: number;
}

export interface HourStats {
  hour: number;
  solveCount: number;
}

export interface TrendData {
  date: string;
  solveCount: number;
  wrongCount: number;
  skippedCount: number;
}

export interface AnalyticsSummary {
  totalSolved: number;
  totalWrong: number;
  totalSkipped: number;
  avgTimePerProblem: number; // in seconds
  skillStats: SkillStats[];
  bestPerformingHours: HourStats[];
  weeklyTrends: TrendData[];
  monthlyTrends: TrendData[];
}

export const getAnalytics = async (userId: Types.ObjectId): Promise<AnalyticsSummary> => {
  const userObjectId = new Types.ObjectId(userId);
  
  // Get all solves for this user
  const solves = await Solve.find({ user: userObjectId })
    .populate("problem", "skills difficulty")
    .sort({ solvedAt: -1 });

  // Count by status
  const totalSolved = solves.filter(s => s.status === "solved").length;
  const totalWrong = solves.filter(s => s.status === "wrong").length;
  const totalSkipped = solves.filter(s => s.status === "skipped").length;

  // Calculate average time spent
  const solvesWithTime = solves.filter(s => s.timeSpent && s.timeSpent > 0);
  const avgTimePerProblem = solvesWithTime.length > 0
    ? solvesWithTime.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / solvesWithTime.length
    : 0;

  // Get skill statistics
  const skillMap: Record<string, any> = {};
  
  solves.forEach(solve => {
    const problem = solve.problem as any;
    if (!problem) return;

    problem.skills?.forEach((skill: string) => {
      if (!skillMap[skill]) {
        skillMap[skill] = {
          skill,
          easy: { solved: 0, total: 0 },
          medium: { solved: 0, total: 0 },
          hard: { solved: 0, total: 0 }
        };
      }

      const difficulty = problem.difficulty?.toLowerCase() || "unknown";
      const diffKey = difficulty as keyof typeof skillMap[string];
      
      if (diffKey in skillMap[skill]) {
        skillMap[skill][diffKey].total++;
        if (solve.status === "solved") {
          skillMap[skill][diffKey].solved++;
        }
      }
    });
  });

  // Calculate rates and totals
  const skillStats: SkillStats[] = Object.values(skillMap).map((skill: any) => ({
    skill: skill.skill,
    easy: {
      ...skill.easy,
      rate: skill.easy.total > 0 ? (skill.easy.solved / skill.easy.total) * 100 : 0
    },
    medium: {
      ...skill.medium,
      rate: skill.medium.total > 0 ? (skill.medium.solved / skill.medium.total) * 100 : 0
    },
    hard: {
      ...skill.hard,
      rate: skill.hard.total > 0 ? (skill.hard.solved / skill.hard.total) * 100 : 0
    },
    totalSolved: skill.easy.solved + skill.medium.solved + skill.hard.solved,
    totalAttempts: skill.easy.total + skill.medium.total + skill.hard.total
  }));

  // Calculate best performing hours
  const hourStats: Record<number, number> = {};
  solves.forEach(solve => {
    if (solve.solvedAt) {
      const hour = new Date(solve.solvedAt).getHours();
      hourStats[hour] = (hourStats[hour] || 0) + 1;
    }
  });

  const bestPerformingHours: HourStats[] = Object.entries(hourStats)
    .map(([hour, count]) => ({ hour: parseInt(hour), solveCount: count }))
    .sort((a, b) => b.solveCount - a.solveCount)
    .slice(0, 5);

  // Get weekly trends (last 8 weeks)
  const weeklyTrends: TrendData[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(addDays(new Date(), -i));
    const weekEnd = endOfWeek(weekStart);
    
    const weekSolves = solves.filter(s => {
      const sDate = new Date(s.solvedAt);
      return sDate >= weekStart && sDate <= weekEnd;
    });

    weeklyTrends.push({
      date: format(weekStart, "MMM dd"),
      solveCount: weekSolves.filter(s => s.status === "solved").length,
      wrongCount: weekSolves.filter(s => s.status === "wrong").length,
      skippedCount: weekSolves.filter(s => s.status === "skipped").length
    });
  }

  // Get monthly trends (last 6 months)
  const monthlyTrends: TrendData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(addDays(new Date(), -i * 30));
    const monthEnd = endOfMonth(monthStart);
    
    const monthSolves = solves.filter(s => {
      const sDate = new Date(s.solvedAt);
      return sDate >= monthStart && sDate <= monthEnd;
    });

    monthlyTrends.push({
      date: format(monthStart, "MMM yyyy"),
      solveCount: monthSolves.filter(s => s.status === "solved").length,
      wrongCount: monthSolves.filter(s => s.status === "wrong").length,
      skippedCount: monthSolves.filter(s => s.status === "skipped").length
    });
  }

  return {
    totalSolved,
    totalWrong,
    totalSkipped,
    avgTimePerProblem,
    skillStats: skillStats.sort((a, b) => b.totalSolved - a.totalSolved),
    bestPerformingHours,
    weeklyTrends,
    monthlyTrends
  };
};

// Get upcoming revisions count and details
export const getRevisionStats = async (userId: Types.ObjectId) => {
  const { RevisionTask } = await import("../models/RevisionTask.js");
  
  const today = startOfDay(new Date());
  const weekEnd = endOfDay(addDays(today, 7));
  
  const revisions = await RevisionTask.find({
    user: userId,
    status: "pending",
    scheduledFor: { $gte: today, $lte: weekEnd }
  }).populate("problem", "title difficulty");

  return {
    dueSoon: revisions.length,
    byDay: revisions.reduce((acc: any, rev: any) => {
      const day = format(new Date(rev.scheduledFor), "MMM dd");
      if (!acc[day]) acc[day] = [];
      acc[day].push(rev);
      return acc;
    }, {})
  };
};
