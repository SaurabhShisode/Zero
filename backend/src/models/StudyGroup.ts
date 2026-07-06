import { Schema, model, Types } from "mongoose";

export interface IStudyGroup {
  name: string;
  description?: string;
  creator: Types.ObjectId;
  members: Types.ObjectId[];
  maxMembers?: number;
  isPrivate: boolean;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studyGroupSchema = new Schema<IStudyGroup>(
  {
    name: { type: String, required: true },
    description: String,
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    maxMembers: { type: Number, default: 50 },
    isPrivate: { type: Boolean, default: false },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ members: 1 });


export const StudyGroup = model<IStudyGroup>("StudyGroup", studyGroupSchema);
