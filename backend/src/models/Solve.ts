import { Schema, model, Types } from "mongoose";

export interface ISolve {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  date: Date;
  solvedAt: Date;
  status: "solved" | "wrong" | "skipped";
  placementMode: boolean;
  approachNote?: string;
  startedAt?: Date;
  timeSpent?: number; // in seconds
  interviewMode?: boolean;
  solvedWithinTime?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const solveSchema = new Schema<ISolve>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    date: { type: Date, required: true },
    solvedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["solved", "wrong", "skipped"],
      required: true,
    },
    placementMode: { type: Boolean, default: false },
    approachNote: String,
    startedAt: Date,
    timeSpent: Number, // in seconds
    interviewMode: { type: Boolean, default: false },
    solvedWithinTime: Boolean,
  },
  { timestamps: true }
);

solveSchema.index({ user: 1, problem: 1, date: 1 }, { unique: true });
solveSchema.index({ user: 1, solvedAt: -1 });

export const Solve = model<ISolve>("Solve", solveSchema);
