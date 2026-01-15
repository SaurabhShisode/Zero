import { User } from "../models/User.js";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/User.js";

export const awardBadges = async (
  user: HydratedDocument<IUser>
): Promise<void> => {
  const updates: string[] = [];

  if (user.streak.current >= 30 && !user.badges.includes("30 Day Consistency")) {
    updates.push("30 Day Consistency");
  }

  if (user.streak.current >= 7 && !user.badges.includes("Zero Miss Week")) {
    updates.push("Zero Miss Week");
  }

  if (updates.length > 0) {
    user.badges.push(...updates);
    await user.save();
  }
};
