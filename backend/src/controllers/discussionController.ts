import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { DiscussionComment } from "../models/Discussion.js";
import { GroupDiscussion } from "../models/GroupDiscussion.js";
import { StudyGroup } from "../models/StudyGroup.js";
import { Types } from "mongoose";
import { createNotification } from "./notificationController.js";

// ─── Public problem comments ───────────────────────────────────────────────

export const listProblemComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const rawId = req.params.problemId;
    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "problemId required" });
    }
    if (!Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid problemId" });
    }

    const problemId = new Types.ObjectId(rawId);
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    // Determine which groups the viewer belongs to (for group-only filter).
    // The route has no requireAuth so we read the token manually if present.
    const authReq = req as AuthRequest;
    let userGroupIds: string[] = [];
    if (authReq.userId) {
      const userGroups = await StudyGroup.find({ members: authReq.userId }, "_id").lean();
      userGroupIds = userGroups.map((g: any) => g._id.toString());
    }

    // Use .lean() so mentionedGroups are plain ObjectId instances — safe for .toString() comparison
    const allComments = await DiscussionComment.find({ problem: problemId })
      .populate("user", "name profileSlug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Filter: group-only comments are only visible to members of the mentioned group(s)
    const visibleComments = allComments.filter((c: any) => {
      if (!c.isGroupOnly) return true;                          // public — always show
      if (!c.mentionedGroups || c.mentionedGroups.length === 0) return false; // no group set → hide
      return c.mentionedGroups.some((gId: any) =>
        userGroupIds.includes(gId.toString())
      );
    });

    // Populate mentionedGroups on the already-filtered lean docs
    const populatedComments = await DiscussionComment.populate(visibleComments, {
      path: "mentionedGroups",
      select: "name"
    });

    return res.json({ comments: populatedComments, page, limit });
  } catch {
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const addProblemComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rawId = req.params.problemId;
    const message = String(req.body.message || "").trim();
    // Frontend sends the exact group IDs the user selected from the autocomplete — no text parsing
    const mentionedGroupIdStrings: string[] = Array.isArray(req.body.mentionedGroupIds)
      ? req.body.mentionedGroupIds
      : [];

    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "problemId required" });
    }
    if (!Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid problemId" });
    }
    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    let mentionedGroups: Types.ObjectId[] = [];
    let isGroupOnly = false;

    if (mentionedGroupIdStrings.length > 0) {
      // Verify the user is actually a member of these groups
      const validIds = mentionedGroupIdStrings.filter((id) => Types.ObjectId.isValid(id));
      const groups = await StudyGroup.find({
        _id: { $in: validIds },
        members: req.userId
      });

      if (groups.length > 0) {
        mentionedGroups = groups.map((g) => g._id as Types.ObjectId);
        isGroupOnly = true;

        // Get problem title for system note
        let problemTitle = "a problem";
        try {
          const { Problem } = await import("../models/Problem.js");
          const prob = await Problem.findById(rawId).select("title").lean() as any;
          if (prob?.title) problemTitle = prob.title;
        } catch { }

        // Get sender name
        let senderName = "Someone";
        try {
          const { User } = await import("../models/User.js");
          const sender = await User.findById(req.userId).select("name").lean() as any;
          if (sender?.name) senderName = sender.name;
        } catch { }

        for (const group of groups) {
          // Drop a system message in the group chat so members can click through
          await GroupDiscussion.create({
            group: group._id,
            problem: rawId,
            user: req.userId,
            type: "system",
            message: `${senderName} tagged @${group.name} — check this problem`,
            isSystem: true
          });

          // Notify each member
          const memberSet = new Set<string>();
          for (const memberId of group.members) {
            const mid = memberId.toString();
            if (mid !== req.userId && !memberSet.has(mid)) {
              memberSet.add(mid);
              await createNotification(
                new Types.ObjectId(mid),
                "group_mention",
                `${group.name}: tagged by a member`,
                `A member tagged your group on "${problemTitle}". Tap to view.`,
                rawId
              );
            }
          }
        }
      }
    }

    const comment = await DiscussionComment.create({
      problem: rawId,
      user: req.userId,
      message,
      mentionedGroups,
      isGroupOnly
    });

    await comment.populate([
      { path: "user", select: "name profileSlug" },
      { path: "mentionedGroups", select: "name" }
    ]);

    return res.status(201).json({ comment });
  } catch {
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

export const deleteProblemComment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { commentId } = req.params;
    const comment = await DiscussionComment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }
    await comment.deleteOne();
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Returns user's groups for @-mention autocomplete on problem page
export const getGroupsForMention = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    const groups = await StudyGroup.find({ members: req.userId }, "name _id");
    return res.json({ groups: groups.map((g) => ({ _id: g._id, name: g.name })) });
  } catch {
    return res.status(500).json({ message: "Failed to fetch groups" });
  }
};