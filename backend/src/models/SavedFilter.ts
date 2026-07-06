import { Schema, model, Types } from "mongoose";
import type { Skill, Difficulty } from "./common.js";
import { Skills, Difficulties } from "./common.js";

export interface ISavedFilter {
  user: Types.ObjectId;
  name: string;
  skills?: Skill[];
  difficulties?: Difficulty[];
  companyTags?: string[];
  solved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const savedFilterSchema = new Schema<ISavedFilter>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    skills: {
      type: [String],
      enum: Skills,
      default: []
    },
    difficulties: {
      type: [String],
      enum: Difficulties,
      default: []
    },
    companyTags: { type: [String], default: [] },
    solved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound index for faster queries
savedFilterSchema.index({ user: 1, name: 1 }, { unique: true });

export const SavedFilter = model<ISavedFilter>("SavedFilter", savedFilterSchema);
