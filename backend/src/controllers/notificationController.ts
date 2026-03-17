import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Types } from "mongoose";
import { Notification } from "../models/Notification.js";

export const getNotifications = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const notifications = await Notification.find({
            user: new Types.ObjectId(req.userId),
        })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.json({ notifications });
    } catch {
        return res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

export const getUnreadCount = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const count = await Notification.countDocuments({
            user: new Types.ObjectId(req.userId),
            read: false,
        });

        return res.json({ count });
    } catch {
        return res.status(500).json({ message: "Failed to fetch count" });
    }
};

export const markAllRead = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        await Notification.updateMany(
            { user: new Types.ObjectId(req.userId), read: false },
            { $set: { read: true } }
        );

        return res.json({ success: true });
    } catch {
        return res.status(500).json({ message: "Failed to mark as read" });
    }
};

export const createNotification = async (
    userId: Types.ObjectId,
    type: "badge" | "streak" | "friend" | "revision",
    title: string,
    body: string = ""
) => {
    try {
        await Notification.create({ user: userId, type, title, body });
    } catch { }
};
