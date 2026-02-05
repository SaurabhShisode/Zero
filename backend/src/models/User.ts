import { Schema, model, Types } from "mongoose";
import type { SkillPreference } from "./common.js";
import { Skills, Difficulties, CompanyFocuses } from "./common.js";

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  preferences: SkillPreference[];
  placementMode: boolean;
  profileSlug: string;
  streak: {
    current: number;
    max: number;
    freezeAvailable: number;
    lastActivityDate: Date | null;
  };
  friends: Types.ObjectId[];
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const preferenceSchema = new Schema<SkillPreference>(
  {
    skill: { type: String, enum: Skills, required: true },
    enabled: { type: Boolean, default: true },
    difficulty: { type: String, enum: Difficulties, required: true },
    preferredLanguage: String,
    timeCommitmentMinutes: Number,
    companyFocus: { type: String, enum: CompanyFocuses },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },

    preferences: { type: [preferenceSchema], default: [] },

    placementMode: { type: Boolean, default: false },

    profileSlug: { type: String, required: true, unique: true },

    friends: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    badges: { type: [String], default: [] },

    streak: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      freezeAvailable: { type: Number, default: 1 },
      lastActivityDate: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
