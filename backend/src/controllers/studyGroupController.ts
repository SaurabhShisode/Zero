import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { StudyGroup } from "../models/StudyGroup.js";
import { StudySession } from "../models/StudySession.js";
import { GroupDiscussion } from "../models/GroupDiscussion.js";
import { GroupCollection } from "../models/GroupCollection.js";
import { GroupCalendarEvent } from "../models/GroupCalendarEvent.js";
import { Solve } from "../models/Solve.js";
import { Types } from "mongoose";
import { randomBytes } from "crypto";
import { startOfWeek } from "date-fns";
import { createNotification } from "./notificationController.js";

const generateInviteCode = (): string => randomBytes(8).toString("hex").toUpperCase();

function asObjectId(id: string) {
  return new Types.ObjectId(id);
}

/** Safely coerce an Express v5 param (string | string[]) to a plain string */
function param(p: string | string[]): string {
  return Array.isArray(p) ? p[0] : p;
}

async function requireGroupMember(groupId: string, userId?: string) {
  if (!userId || !Types.ObjectId.isValid(groupId)) return null;

  const group = await StudyGroup.findById(groupId);
  if (!group) return null;

  const isMember = group.members.some((member) => member.toString() === userId);
  return isMember ? group : null;
}

export const createStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, isPrivate = false, maxMembers = 50 } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await StudyGroup.create({
      name: name.trim(),
      description,
      creator: req.userId,
      members: [req.userId],
      maxMembers,
      isPrivate,
      inviteCode: generateInviteCode()
    });

    const populated = await group.populate([
      { path: "creator", select: "name profileSlug" },
      { path: "members", select: "name profileSlug" }
    ]);

    return res.status(201).json({ group: populated });
  } catch {
    return res.status(500).json({ message: "Failed to create study group" });
  }
};

export const getStudyGroups = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const groups = await StudyGroup.find({ members: req.userId })
      .populate("creator", "name profileSlug")
      .populate("members", "name profileSlug")
      .sort({ createdAt: -1 });

    return res.json({ groups });
  } catch {
    return res.status(500).json({ message: "Failed to fetch study groups" });
  }
};

export const getStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.id), req.userId);
    if (!group) return res.status(404).json({ message: "Study group not found" });

    const populated = await group.populate([
      { path: "creator", select: "name profileSlug" },
      { path: "members", select: "name profileSlug" }
    ]);

    return res.json({ group: populated });
  } catch {
    return res.status(500).json({ message: "Failed to fetch study group" });
  }
};

export const joinStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: "Invite code is required" });

    const group = await StudyGroup.findOne({ inviteCode: String(inviteCode).trim().toUpperCase() });
    if (!group) return res.status(404).json({ message: "Study group not found" });

    if (group.members.some((member) => member.toString() === req.userId)) {
      return res.status(400).json({ message: "You are already a member" });
    }

    if (group.members.length >= (group.maxMembers || 50)) {
      return res.status(400).json({ message: "Group is full" });
    }

    group.members.push(asObjectId(req.userId));
    await group.save();

    const populated = await group.populate([
      { path: "creator", select: "name profileSlug" },
      { path: "members", select: "name profileSlug" }
    ]);
    return res.json({ group: populated });
  } catch {
    return res.status(500).json({ message: "Failed to join study group" });
  }
};

export const leaveStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const group = await StudyGroup.findById(id);
    if (!group) return res.status(404).json({ message: "Study group not found" });

    group.members = group.members.filter((member) => member.toString() !== req.userId);
    await group.save();

    if (group.creator.toString() === req.userId && group.members.length === 0) {
      await StudyGroup.findByIdAndDelete(id);
      await cleanupGroupResources(param(id));
    }

    return res.json({ message: "Left study group successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to leave study group" });
  }
};

export const updateStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { name, description, maxMembers } = req.body;

    const group = await StudyGroup.findById(id);
    if (!group || group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Only creator can update group" });
    }

    if (name) group.name = String(name).trim();
    if (description !== undefined) group.description = description;
    if (maxMembers) group.maxMembers = maxMembers;

    await group.save();
    return res.json({ group });
  } catch {
    return res.status(500).json({ message: "Failed to update study group" });
  }
};

export const deleteStudyGroup = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const group = await StudyGroup.findById(id);
    if (!group || group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Only creator can delete group" });
    }

    await StudyGroup.findByIdAndDelete(id);
    await cleanupGroupResources(param(id));

    return res.json({ message: "Study group deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to delete study group" });
  }
};

async function cleanupGroupResources(groupId: string) {
  await Promise.all([
    StudySession.deleteMany({ group: groupId }),
    GroupDiscussion.deleteMany({ group: groupId }),
    GroupCollection.deleteMany({ group: groupId }),
    GroupCalendarEvent.deleteMany({ group: groupId })
  ]);
}

export const getGroupLeaderboard = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const solves = await Solve.find({
      user: { $in: group.members },
      solvedAt: { $gte: weekStart }
    });

    const populated = await group.populate("members", "name profileSlug streak");
    const members = populated.members as any[];

    const leaderboard = members.map((member) => {
      const memberSolves = solves.filter((solve) => solve.user.toString() === member._id.toString());
      const solved = memberSolves.filter((solve) => solve.status === "solved").length;
      const attempts = memberSolves.length;
      const timed = memberSolves.filter((solve) => (solve.timeSpent || 0) > 0);

      return {
        user: {
          _id: member._id,
          name: member.name,
          profileSlug: member.profileSlug
        },
        weeklySolved: solved,
        weeklyAttempts: attempts,
        successRate: attempts > 0 ? Math.round((solved / attempts) * 100) : 0,
        streak: member.streak?.current || 0,
        avgCompletionTime: timed.length
          ? Math.round(timed.reduce((sum, solve) => sum + (solve.timeSpent || 0), 0) / timed.length)
          : 0
      };
    }).sort((a, b) => b.weeklySolved - a.weeklySolved || b.successRate - a.successRate);

    return res.json({ leaderboard, weekStart });
  } catch {
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

export const startStudySession = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { groupId } = req.params;
    const { title, problemId, focusSkill, difficulty, durationMinutes } = req.body;
    if (!groupId) return res.status(400).json({ message: "groupId is required" });

    const group = await requireGroupMember(param(groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const session = await StudySession.create({
      group: groupId,
      title: title || `${focusSkill || "Focused"} study session`,
      problem: problemId || undefined,
      focusSkill,
      difficulty,
      durationMinutes,
      participants: [req.userId],
      startedAt: new Date(),
      status: "active"
    });

    // Notify all group members about the new session
    const notifyMembers = group.members.filter((m) => m.toString() !== req.userId);
    await Promise.all(
      notifyMembers.map((memberId) =>
        createNotification(
          new Types.ObjectId(memberId.toString()),
          "group_session",
          `New session in ${group.name}`,
          `"${session.title}" has started — ${focusSkill || "General"} · ${difficulty || "Mixed"} · ${durationMinutes || 0} min`,
          group._id.toString()
        )
      )
    );

    return res.status(201).json({ session });
  } catch {
    return res.status(500).json({ message: "Failed to start study session" });
  }
};

export const endStudySession = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { attempted = 0, solved = 0, wrong = 0, skipped = 0, totalFocusMinutes = 0 } = req.body;
    const session = await StudySession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Study session not found" });

    const group = await requireGroupMember(session.group.toString(), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    session.status = "completed";
    session.endedAt = new Date();
    session.attempted = Number(attempted);
    session.solved = Number(solved);
    session.wrong = Number(wrong);
    session.skipped = Number(skipped);
    session.totalFocusMinutes = Number(totalFocusMinutes);
    if (!session.participants.some((participant) => participant.toString() === req.userId)) {
      session.participants.push(asObjectId(req.userId));
    }
    await session.save();

    return res.json({ session });
  } catch {
    return res.status(500).json({ message: "Failed to end study session" });
  }
};

export const getGroupSessions = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const sessions = await StudySession.find({ group: req.params.groupId })
      .populate("participants", "name profileSlug")
      .populate("problem", "title difficulty")
      .sort({ startedAt: -1 })
      .limit(50);

    return res.json({ sessions });
  } catch {
    return res.status(500).json({ message: "Failed to fetch study sessions" });
  }
};

export const createGroupDiscussion = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const { message, type = "note" } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Detect @MemberName mentions within the group
    const mentionRegex = /@([A-Za-z0-9_.\- ]+)/g;
    const rawMatches = [...message.matchAll(mentionRegex)].map((m) => m[1].trim());
    const mentionedUsers: Types.ObjectId[] = [];

    if (rawMatches.length > 0) {
      // Match member names within this group (case-insensitive)
      for (const m of group.members) {
        // Populate member to get name
      }
      // Fetch members with names
      const populatedGroup = await group.populate("members", "name");
      for (const member of populatedGroup.members as any[]) {
        if (member._id.toString() === req.userId) continue;
        const nameMatches = rawMatches.some((q) =>
          member.name.toLowerCase().includes(q.toLowerCase()) ||
          q.toLowerCase().includes(member.name.toLowerCase())
        );
        if (nameMatches) {
          mentionedUsers.push(member._id);
          // Notify the mentioned member
          await createNotification(
            new Types.ObjectId(member._id.toString()),
            "group_mention",
            `You were mentioned in ${group.name}`,
            message.slice(0, 120),
            group._id.toString()
          );
        }
      }
    }

    const discussion = await GroupDiscussion.create({
      group: req.params.groupId,
      user: req.userId,
      type,
      message: message.trim(),
      mentionedUsers
    });

    const populated = await discussion.populate([
      { path: "user", select: "name profileSlug" },
      { path: "problem", select: "title difficulty" },
      { path: "mentionedUsers", select: "name profileSlug" }
    ]);

    return res.status(201).json({ discussion: populated });
  } catch {
    return res.status(500).json({ message: "Failed to create discussion" });
  }
};

export const getGroupDiscussions = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const query: Record<string, unknown> = { group: req.params.groupId };
    if (req.query.problemId) query.problem = req.query.problemId;

    const discussions = await GroupDiscussion.find(query)
      .populate("user", "name profileSlug")
      .populate("problem", "title difficulty _id")
      .populate("mentionedUsers", "name profileSlug")
      .sort({ createdAt: -1 })
      .limit(80);

    return res.json({ discussions });
  } catch {
    return res.status(500).json({ message: "Failed to fetch discussions" });
  }
};

export const createGroupCollection = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const { name, notes, problemId } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const collection = await GroupCollection.create({
      group: req.params.groupId,
      name: name.trim(),
      notes,
      createdBy: req.userId,
      problems: problemId ? [problemId] : []
    });

    const populated = await collection.populate([
      { path: "createdBy", select: "name profileSlug" },
      { path: "problems", select: "title difficulty skills link" }
    ]);

    return res.status(201).json({ collection: populated });
  } catch {
    return res.status(500).json({ message: "Failed to create collection" });
  }
};

export const addProblemToGroupCollection = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const { problemId } = req.body;
    if (!problemId) return res.status(400).json({ message: "problemId is required" });

    const collection = await GroupCollection.findOneAndUpdate(
      { _id: req.params.collectionId, group: req.params.groupId },
      { $addToSet: { problems: problemId } },
      { new: true }
    ).populate("problems", "title difficulty skills link");

    if (!collection) return res.status(404).json({ message: "Collection not found" });

    // Notify all group members that a problem was added
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
    return res.status(500).json({ message: "Failed to update collection" });
  }
};

export const getGroupCollections = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const collections = await GroupCollection.find({ group: req.params.groupId })
      .populate("createdBy", "name profileSlug")
      .populate("problems", "title difficulty skills link")
      .sort({ updatedAt: -1 });

    return res.json({ collections });
  } catch {
    return res.status(500).json({ message: "Failed to fetch collections" });
  }
};

export const createGroupEvent = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const { title, type = "session", scheduledFor, durationMinutes, notes } = req.body;
    if (!title || !scheduledFor) {
      return res.status(400).json({ message: "title and scheduledFor are required" });
    }

    const event = await GroupCalendarEvent.create({
      group: req.params.groupId,
      title: String(title).trim(),
      type,
      scheduledFor: new Date(scheduledFor),
      durationMinutes,
      notes,
      createdBy: req.userId
    });

    // Notify all group members about the new event
    const notifyMembers = group.members.filter((m) => m.toString() !== req.userId);
    await Promise.all(
      notifyMembers.map((memberId) =>
        createNotification(
          new Types.ObjectId(memberId.toString()),
          "group_event",
          `New event in ${group.name}`,
          `"${String(title).trim()}" scheduled for ${new Date(scheduledFor).toLocaleDateString()}`,
          group._id.toString()
        )
      )
    );

    return res.status(201).json({ event });
  } catch {
    return res.status(500).json({ message: "Failed to create event" });
  }
};

export const getGroupEvents = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const group = await requireGroupMember(param(req.params.groupId), req.userId);
    if (!group) return res.status(403).json({ message: "Not a member of this group" });

    const events = await GroupCalendarEvent.find({ group: req.params.groupId })
      .populate("createdBy", "name profileSlug")
      .sort({ scheduledFor: 1 })
      .limit(80);

    return res.json({ events });
  } catch {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};
