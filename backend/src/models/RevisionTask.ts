import { Schema, model, Types } from "mongoose";

export interface IRevisionTask {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  scheduledFor: Date;
  status: "pending" | "done";
  createdAt: Date;
  updatedAt: Date;
}

const revisionTaskSchema = new Schema<IRevisionTask>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    scheduledFor: { type: Date, required: true, index: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
  },
  { timestamps: true }
);

revisionTaskSchema.index(
  { user: 1, problem: 1, scheduledFor: 1 },
  { unique: true }
);

export const RevisionTask = model<IRevisionTask>(
  "RevisionTask",
  revisionTaskSchema
);
