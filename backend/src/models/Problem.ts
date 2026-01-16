import { Schema, model } from "mongoose";
import type { Skill, Difficulty } from "./common.js";
import { Skills, Difficulties } from "./common.js";

export interface IProblem {
  title: string;
  link: string;
  skills: Skill[];
  difficulty: Difficulty;
  companyTags: string[];
  cooldownDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },

    link: {
      type: String,
      required: true,
      unique: true
    },

    skills: {
      type: [String],
      enum: Skills,
      required: true
    },

    difficulty: {
      type: String,
      enum: Difficulties,
      required: true
    },

    companyTags: { type: [String], default: [] },

    cooldownDays: { type: Number, default: 14 }
  },
  { timestamps: true }
);

export const Problem = model<IProblem>("Problem", problemSchema);
