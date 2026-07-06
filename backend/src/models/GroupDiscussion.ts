import { Schema, model, Types } from "mongoose";

export interface IGroupDiscussion {
  group: Types.ObjectId;
  problem?: Types.ObjectId;
  user: Types.ObjectId;
  type: "hint" | "approach" | "complexity" | "mistake" | "note" | "system";
  message: string;
  mentionedUsers?: Types.ObjectId[]; // @member mentions in group chat
  isSystem?: boolean;                // auto-created system messages
  createdAt: Date;
  updatedAt: Date;
}

const groupDiscussionSchema = new Schema<IGroupDiscussion>(
  {
    group: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["hint", "approach", "complexity", "mistake", "note", "system"],
      default: "note"
    },
    message: { type: String, required: true },
    mentionedUsers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true }
);

groupDiscussionSchema.index({ group: 1, problem: 1, createdAt: -1 });

export const GroupDiscussion = model<IGroupDiscussion>("GroupDiscussion", groupDiscussionSchema);
