import { Schema, model, Types } from "mongoose";

export interface INotification {
    user: Types.ObjectId;
    type: "badge" | "streak" | "friend" | "revision" | "group_session" | "group_event" | "group_collection" | "group_mention";
    title: string;
    body: string;
    read: boolean;
    link?: string; // optional deep-link (e.g. groupId or problemId)
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["badge", "streak", "friend", "revision", "group_session", "group_event", "group_collection", "group_mention"],
            required: true,
        },
        title: { type: String, required: true },
        body: { type: String, default: "" },
        read: { type: Boolean, default: false },
        link: { type: String, default: "" },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
