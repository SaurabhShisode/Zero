import { Schema, model, Types } from "mongoose";

export interface IDiscussionComment {
  dailyProblem: Types.ObjectId;
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussionComment>(
  {
    dailyProblem: {
      type: Schema.Types.ObjectId,
      ref: "DailyProblem",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const DiscussionComment = model<IDiscussionComment>(
  "DiscussionComment",
  discussionSchema
);
