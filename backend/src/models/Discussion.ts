import { Schema, model, Types } from "mongoose";

export interface IDiscussionComment {
  problem: Types.ObjectId;
  user: Types.ObjectId;
  message: string;
  // Group mention: if the comment tags @GroupName, it becomes group-only visible
  mentionedGroups?: Types.ObjectId[]; // group IDs mentioned via @
  isGroupOnly?: boolean;              // true when at least one group was @-mentioned
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    mentionedGroups: {
      type: [{ type: Schema.Types.ObjectId, ref: "StudyGroup" }],
      default: []
    },
    isGroupOnly: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

discussionSchema.index({ problem: 1, createdAt: -1 });

export const DiscussionComment = model<IDiscussionComment>(
  "DiscussionComment",
  discussionSchema
);
