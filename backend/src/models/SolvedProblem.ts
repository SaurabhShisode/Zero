import { Schema, model, Types } from "mongoose";

export interface ISolvedProblem {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  dailyProblem?: Types.ObjectId;
  solvedAt: Date;
}

const solvedProblemSchema = new Schema<ISolvedProblem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true
    },

    dailyProblem: {
      type: Schema.Types.ObjectId,
      ref: "DailyProblem"
    },

    solvedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

solvedProblemSchema.index({ user: 1, problem: 1 }, { unique: true });

export const SolvedProblem = model<ISolvedProblem>(
  "SolvedProblem",
  solvedProblemSchema
);
