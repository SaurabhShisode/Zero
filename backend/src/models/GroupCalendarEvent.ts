import { Schema, model, Types } from "mongoose";

export interface IGroupCalendarEvent {
  group: Types.ObjectId;
  title: string;
  type: "session" | "revision" | "contest" | "reminder";
  scheduledFor: Date;
  durationMinutes?: number;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupCalendarEventSchema = new Schema<IGroupCalendarEvent>(
  {
    group: { type: Schema.Types.ObjectId, ref: "StudyGroup", required: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["session", "revision", "contest", "reminder"],
      default: "session"
    },
    scheduledFor: { type: Date, required: true, index: true },
    durationMinutes: Number,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

groupCalendarEventSchema.index({ group: 1, scheduledFor: 1 });

export const GroupCalendarEvent = model<IGroupCalendarEvent>("GroupCalendarEvent", groupCalendarEventSchema);
