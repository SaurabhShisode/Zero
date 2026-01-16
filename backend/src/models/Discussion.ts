import { Schema, model, Types } from "mongoose";

export interface IDiscussionComment {
  problem: Types.ObjectId;
  dailyProblem?: Types.ObjectId;
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<IDiscussionComment>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true
    },

    dailyProblem: {
      type: Schema.Types.ObjectId,
      ref: "DailyProblem",
      index: true
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

discussionSchema.index({ problem: 1, createdAt: -1 });
discussionSchema.index({ dailyProblem: 1, createdAt: -1 });

export const DiscussionComment = model<IDiscussionComment>(
  "DiscussionComment",
  discussionSchema
);
