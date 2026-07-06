import { Router } from "express";
import {
  createStudyGroup,
  getStudyGroups,
  getStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  getGroupLeaderboard,
  startStudySession,
  endStudySession,
  getGroupSessions,
  createGroupDiscussion,
  getGroupDiscussions,
  createGroupCollection,
  addProblemToGroupCollection,
  getGroupCollections,
  createGroupEvent,
  getGroupEvents
} from "../controllers/studyGroupController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Study Group routes
router.post("/", requireAuth, createStudyGroup);
router.get("/", requireAuth, getStudyGroups);
router.post("/join", requireAuth, joinStudyGroup);

router.get("/:groupId/leaderboard", requireAuth, getGroupLeaderboard);
router.get("/:groupId/sessions", requireAuth, getGroupSessions);
router.post("/:groupId/sessions", requireAuth, startStudySession);
router.get("/:groupId/discussions", requireAuth, getGroupDiscussions);
router.post("/:groupId/discussions", requireAuth, createGroupDiscussion);
router.get("/:groupId/collections", requireAuth, getGroupCollections);
router.post("/:groupId/collections", requireAuth, createGroupCollection);
router.post("/:groupId/collections/:collectionId/problems", requireAuth, addProblemToGroupCollection);
router.get("/:groupId/events", requireAuth, getGroupEvents);
router.post("/:groupId/events", requireAuth, createGroupEvent);

router.put("/sessions/:id/end", requireAuth, endStudySession);

router.get("/:id", requireAuth, getStudyGroup);
router.delete("/:id/leave", requireAuth, leaveStudyGroup);
router.put("/:id", requireAuth, updateStudyGroup);
router.delete("/:id", requireAuth, deleteStudyGroup);

export default router;
