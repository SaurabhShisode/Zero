import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import { Bookmark } from "../models/Bookmark.js";
import { StudyGroup } from "../models/StudyGroup.js";
import { GroupCollection } from "../models/GroupCollection.js";
import { createNotification } from "./notificationController.js";

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

        const { problemId, collection } = req.body;
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

        await Bookmark.create({
            user: userId,
            problem: problemObjectId,
            collection: collection || "Default"
        });
        return res.json({ bookmarked: true });
    } catch {
        return res.status(500).json({ message: "Failed to toggle bookmark" });
    }
};

// Bookmark to a named personal collection
export const bookmarkToCollection = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { problemId, collection } = req.body;
        if (!problemId) return res.status(400).json({ message: "problemId required" });

        const userId = new Types.ObjectId(req.userId);
        const problemObjectId = new Types.ObjectId(problemId);
        const collectionName = String(collection || "Default").trim();

        // Upsert: create or update collection name
        const bookmark = await Bookmark.findOneAndUpdate(
            { user: userId, problem: problemObjectId },
            { user: userId, problem: problemObjectId, collection: collectionName },
            { upsert: true, new: true }
        ).populate("problem", "title difficulty");

        return res.json({ bookmarked: true, bookmark });
    } catch {
        return res.status(500).json({ message: "Failed to bookmark to collection" });
    }
};

// Add problem to a group collection from problem page
export const addToGroupCollection = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { problemId, groupId, collectionId } = req.body;
        if (!problemId || !groupId || !collectionId) {
            return res.status(400).json({ message: "problemId, groupId, and collectionId are required" });
        }

        // Verify membership
        const group = await StudyGroup.findOne({ _id: groupId, members: req.userId });
        if (!group) return res.status(403).json({ message: "Not a member of this group" });

        const collection = await GroupCollection.findOneAndUpdate(
            { _id: collectionId, group: groupId },
            { $addToSet: { problems: problemId } },
            { new: true }
        ).populate("problems", "title difficulty skills link");

        if (!collection) return res.status(404).json({ message: "Collection not found" });

        // Notify other group members
        const notifyMembers = group.members.filter((m) => m.toString() !== req.userId);
        await Promise.all(
            notifyMembers.map((memberId) =>
                createNotification(
                    new Types.ObjectId(memberId.toString()),
                    "group_collection",
                    `Problem added to "${collection.name}"`,
                    `A new problem was added to a shared collection in ${group.name}`,
                    group._id.toString()
                )
            )
        );

        return res.json({ collection });
    } catch {
        return res.status(500).json({ message: "Failed to add to group collection" });
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

        const problemObjId = new Types.ObjectId(rawId);

        // 1. Check personal bookmark
        const personalBookmark = await Bookmark.exists({
            user: new Types.ObjectId(req.userId),
            problem: problemObjId,
        });
        if (personalBookmark) return res.json({ bookmarked: true });

        // 2. Check group collections the user is a member of
        const userGroups = await StudyGroup.find({ members: req.userId }, "_id").lean();
        const groupIds = userGroups.map((g: any) => g._id);
        if (groupIds.length > 0) {
            const inGroup = await GroupCollection.exists({
                group: { $in: groupIds },
                problems: problemObjId,
            });
            if (inGroup) return res.json({ bookmarked: true });
        }

        return res.json({ bookmarked: false });
    } catch {
        return res.status(500).json({ message: "Failed to check bookmark" });
    }
};

// Get bookmarks by collection
export const getBookmarksByCollection = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { collection } = req.params;
        if (!collection) return res.status(400).json({ message: "collection required" });

        const bookmarks = await Bookmark.find({
            user: new Types.ObjectId(req.userId),
            collection: collection === "default" ? "Default" : collection
        })
            .populate("problem", "title link difficulty skills companyTags")
            .sort({ createdAt: -1 });

        return res.json({ bookmarks });
    } catch {
        return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
};

// Get all collections for a user
export const getCollections = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const collections = await Bookmark.distinct("collection", {
            user: new Types.ObjectId(req.userId)
        });

        // Get count for each collection
        const counts = await Promise.all(
            (collections || []).map(async (col) => ({
                name: col,
                count: await Bookmark.countDocuments({
                    user: new Types.ObjectId(req.userId),
                    collection: col
                })
            }))
        );

        return res.json({ collections: counts.sort((a, b) => b.count - a.count) });
    } catch {
        return res.status(500).json({ message: "Failed to fetch collections" });
    }
};

// Update bookmark (collection, tags, notes)
export const updateBookmark = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params;
        const { collection, tags, notes } = req.body;

        const bookmark = await Bookmark.findOneAndUpdate(
            {
                _id: id,
                user: new Types.ObjectId(req.userId)
            },
            {
                ...(collection && { collection }),
                ...(tags && { tags }),
                ...(notes !== undefined && { notes })
            },
            { new: true }
        ).populate("problem", "title link difficulty skills companyTags");

        if (!bookmark) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        return res.json({ bookmark });
    } catch {
        return res.status(500).json({ message: "Failed to update bookmark" });
    }
};

// Get bookmarks by tag
export const getBookmarksByTag = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const { tag } = req.params;
        if (!tag) return res.status(400).json({ message: "tag required" });

        const bookmarks = await Bookmark.find({
            user: new Types.ObjectId(req.userId),
            tags: tag
        })
            .populate("problem", "title link difficulty skills companyTags")
            .sort({ createdAt: -1 });

        return res.json({ bookmarks });
    } catch {
        return res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
};

// Get all tags for user
export const getAllTags = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const bookmarks = await Bookmark.find({
            user: new Types.ObjectId(req.userId)
        });

        const tagMap: Record<string, number> = {};
        bookmarks.forEach(b => {
            (b.tags || []).forEach(tag => {
                tagMap[tag] = (tagMap[tag] || 0) + 1;
            });
        });

        const tags = Object.entries(tagMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return res.json({ tags });
    } catch {
        return res.status(500).json({ message: "Failed to fetch tags" });
    }
};
