import { User } from "../models/User.js";
import { Solve } from "../models/Solve.js";
import { toDay } from "../utils/dates.js";
export const getHeatmap = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const solves = await Solve.find({ user: req.userId, status: "solved" }).select("date");
    const counts = {};
    solves.forEach((s) => {
        const key = toDay(s.date).toISOString();
        counts[key] = (counts[key] ?? 0) + 1;
    });
    return res.json({ counts });
};
export const publicProfile = async (req, res) => {
    const slug = req.params.slug;
    if (!slug)
        return res.status(400).json({ message: "slug required" });
    const user = await User.findOne({ profileSlug: slug }).select("name profileSlug streak");
    if (!user)
        return res.status(404).json({ message: "Not found" });
    const recent = await Solve.find({ user: user._id, status: "solved" })
        .sort({ date: -1 })
        .limit(30)
        .select("date");
    return res.json({ user, recent });
};
//# sourceMappingURL=profileController.js.map