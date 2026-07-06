import { Schema, model, Types } from "mongoose";

export interface IStudySession {
  group: Types.ObjectId;
  problem?: Types.ObjectId;
  title: string;
  focusSkill?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  durationMinutes?: number;
  participants: Types.ObjectId[];
  startedAt: Date;
  endedAt?: Date;
  status: "active" | "completed";
  attempted: number;
  solved: number;
  wrong: number;
  skipped: number;
  totalFocusMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
  {
    group: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem" },
    title: { type: String, required: true, default: "Study session" },
    focusSkill: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    durationMinutes: Number,
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: Date,
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    },
    attempted: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

studySessionSchema.index({ group: 1, status: 1 });
studySessionSchema.index({ startedAt: -1 });

export const StudySession = model<IStudySession>("StudySession", studySessionSchema);
