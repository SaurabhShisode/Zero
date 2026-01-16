import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { Skills } from "../models/common.js";
import type { Difficulty } from "../models/common.js";
import admin from "../config/firebase.js";
const randomSuffix = (): string => Math.random().toString(36).slice(2, 7);

const DEFAULT_DIFFICULTY: Difficulty = "Easy";

export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const name = String(req.body.name || "").trim();

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const profileSlug = `${email.split("@")[0]}-${randomSuffix()}`;

    const defaultPreferences = Skills.map((skill) => ({
      skill,
      enabled: false,
      difficulty: DEFAULT_DIFFICULTY,
    }));

    const user = await User.create({
      email,
      passwordHash,
      name,
      profileSlug,
      preferences: defaultPreferences,
      streak: {
        current: 0,
        max: 0,
        freezeAvailable: 1,
      },
      placementMode: false,
    });

    const token = signToken(user.id);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileSlug: user.profileSlug,
        preferences: user.preferences,
      },
    });
  } catch {
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileSlug: user.profileSlug,
        preferences: user.preferences,
      },
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const email = decoded.email?.toLowerCase();
    const name = decoded.name || "Zero User";

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const profileSlug = `${email.split("@")[0]}-${randomSuffix()}`;

      const defaultPreferences = Skills.map((skill) => ({
        skill,
        enabled: false,
        difficulty: DEFAULT_DIFFICULTY
      }));

      user = await User.create({
        email,
        passwordHash: "google",
        name,
        profileSlug,
        preferences: defaultPreferences,
        streak: {
          current: 0,
          max: 0,
          freezeAvailable: 1
        },
        placementMode: false
      });
    }

    const jwtToken = signToken(user.id);

    return res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileSlug: user.profileSlug,
        preferences: user.preferences
      }
    });
  } catch {
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
