import { addDays } from "date-fns";
import { Solve } from "../models/Solve.js";
import { RevisionTask } from "../models/RevisionTask.js";
import { toDay } from "../utils/dates.js";
import { User } from "../models/User.js";
export const markSolve = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const { problemId, status, approachNote, placementMode } = req.body;
    const date = toDay();
    const solve = await Solve.findOneAndUpdate({ user: req.userId, problem: problemId, date }, { status, approachNote, placementMode }, { upsert: true, new: true });
    if (status === "wrong" || status === "skipped") {
        const offsets = [3, 7, 14];
        for (const offset of offsets) {
            const scheduledFor = toDay(addDays(date, offset));
            await RevisionTask.updateOne({ user: req.userId, problem: problemId, scheduledFor }, { $setOnInsert: { status: "pending" } }, { upsert: true });
        }
    }
    // Basic streak handling
    const user = await User.findById(req.userId);
    if (user) {
        const lastSolve = await Solve.findOne({ user: req.userId })
            .sort({ date: -1 })
            .limit(1);
        const isTodaySolve = solve && solve.status === "solved";
        if (isTodaySolve) {
            const yesterday = toDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
            const hadYesterday = lastSolve && toDay(lastSolve.date).getTime() === yesterday.getTime();
            user.streak.current = hadYesterday ? user.streak.current + 1 : 1;
            user.streak.max = Math.max(user.streak.max, user.streak.current);
            await user.save();
        }
    }
    return res.json({ solve });
};
//# sourceMappingURL=solveController.js.map