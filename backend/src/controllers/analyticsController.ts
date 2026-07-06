import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { getAnalytics, getRevisionStats } from "../services/analytics.js";
import { Types } from "mongoose";

export const getAnalyticsData = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const analytics = await getAnalytics(new Types.ObjectId(req.userId));
    return res.json({ analytics });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

export const getRevisions = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const revisionStats = await getRevisionStats(new Types.ObjectId(req.userId));
    return res.json(revisionStats);
  } catch (err) {
    console.error("Revision stats error:", err);
    return res.status(500).json({ message: "Failed to fetch revision stats" });
  }
};
