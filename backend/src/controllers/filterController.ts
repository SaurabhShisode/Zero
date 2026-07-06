import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { SavedFilter } from "../models/SavedFilter.js";
import { Types } from "mongoose";

export const getSavedFilters = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filters = await SavedFilter.find({ user: req.userId })
      .sort({ createdAt: -1 });

    return res.json({ filters });
  } catch {
    return res.status(500).json({ message: "Failed to fetch saved filters" });
  }
};

export const createSavedFilter = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, skills, difficulties, companyTags, solved } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Filter name is required" });
    }

    // Check if filter name already exists for this user
    const existing = await SavedFilter.findOne({ user: req.userId, name });
    if (existing) {
      return res.status(400).json({ message: "Filter with this name already exists" });
    }

    const filter = await SavedFilter.create({
      user: req.userId,
      name,
      skills: skills || [],
      difficulties: difficulties || [],
      companyTags: companyTags || [],
      solved: solved || false
    });

    return res.status(201).json({ filter });
  } catch {
    return res.status(500).json({ message: "Failed to create saved filter" });
  }
};

export const updateSavedFilter = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { name, skills, difficulties, companyTags, solved } = req.body;

    const filter = await SavedFilter.findOneAndUpdate(
      { _id: id, user: req.userId },
      { name, skills, difficulties, companyTags, solved },
      { new: true }
    );

    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    return res.json({ filter });
  } catch {
    return res.status(500).json({ message: "Failed to update saved filter" });
  }
};

export const deleteSavedFilter = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const result = await SavedFilter.findOneAndDelete({
      _id: id,
      user: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: "Filter not found" });
    }

    return res.json({ message: "Filter deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to delete saved filter" });
  }
};
