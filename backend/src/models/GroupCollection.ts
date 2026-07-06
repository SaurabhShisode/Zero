import { Schema, model, Types } from "mongoose";

export interface IGroupCollection {
  group: Types.ObjectId;
  name: string;
  notes?: string;
  createdBy: Types.ObjectId;
  problems: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupCollectionSchema = new Schema<IGroupCollection>(
  {
    group: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true, index: true },
    name: { type: String, required: true },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problems: { type: [{ type: Schema.Types.ObjectId, ref: "Problem" }], default: [] }
  },
  { timestamps: true }
);

groupCollectionSchema.index({ group: 1, name: 1 }, { unique: true });

export const GroupCollection = model<IGroupCollection>("GroupCollection", groupCollectionSchema);
