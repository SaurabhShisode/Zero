import { Schema, model, Types } from "mongoose";

export interface INotification {
    user: Types.ObjectId;
    type: "badge" | "streak" | "friend" | "revision";
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["badge", "streak", "friend", "revision"],
            required: true,
        },
        title: { type: String, required: true },
        body: { type: String, default: "" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
