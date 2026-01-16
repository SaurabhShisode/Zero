import { Schema, model, Types } from "mongoose";
import type { Skill } from "./common.js";
import { Skills } from "./common.js";

export interface IDailyProblem {
  date: Date;
  skill: Skill;

  problem: Types.ObjectId;
  assignedAt: Date;
}

const dailyProblemSchema = new Schema<IDailyProblem>(
  {
    date: { type: Date, required: true, index: true },

    skill: {
      type: String,
      enum: Skills,
      required: true
    },


    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },

    assignedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dailyProblemSchema.index({ date: 1, skill: 1 }, { unique: true });

export const DailyProblem = model<IDailyProblem>(
  "DailyProblem",
  dailyProblemSchema
);
