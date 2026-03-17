import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import { Bookmark } from "../models/Bookmark.js";

export const getBookmarks = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const bookmarks = await Bookmark.find({
            user: new Types.ObjectId(req.userId),
        })
            .populate("problem", "title link difficulty skills companyTags")
            .sort({ createdAt: -1 });

        return res.json({ bookmarks });
    } catch {
        return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
};

export const toggleBookmark = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { problemId } = req.body;
        if (!problemId) return res.status(400).json({ message: "problemId required" });

        const userId = new Types.ObjectId(req.userId);
        const problemObjectId = new Types.ObjectId(problemId);

        const existing = await Bookmark.findOne({
            user: userId,
            problem: problemObjectId,
        });

        if (existing) {
            await Bookmark.deleteOne({ _id: existing._id });
            return res.json({ bookmarked: false });
        }

        await Bookmark.create({ user: userId, problem: problemObjectId });
        return res.json({ bookmarked: true });
    } catch {
        return res.status(500).json({ message: "Failed to toggle bookmark" });
    }
};

export const isBookmarked = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const rawId = req.params.problemId as string;
        if (!rawId) return res.status(400).json({ message: "problemId required" });

        const exists = await Bookmark.exists({
            user: new Types.ObjectId(req.userId),
            problem: new Types.ObjectId(rawId),
        });

        return res.json({ bookmarked: Boolean(exists) });
    } catch {
        return res.status(500).json({ message: "Failed to check bookmark" });
    }
};
