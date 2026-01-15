import { subDays } from "date-fns";
import { DailyProblem } from "../models/DailyProblem.js";
import { Problem } from "../models/Problem.js";
import { Skills } from "../models/common.js";
import env from "../config/env.js";
import { toDay } from "../utils/dates.js";
export const assignDailyProblems = async (inputDate) => {
    const today = toDay(inputDate);
    for (const skill of Skills) {
        const existing = await DailyProblem.findOne({ date: today, skill });
        if (existing)
            continue;
        const cooldownDays = env.defaultCooldownDays;
        const since = subDays(today, cooldownDays);
        const recent = await DailyProblem.find({
            skill,
            date: { $gte: since },
        }).select("problem");
        const excludeIds = recent.map((r) => r.problem);
        const candidates = await Problem.aggregate([
            { $match: { skill, _id: { $nin: excludeIds } } },
            { $sample: { size: 1 } },
        ]);
        if (candidates.length === 0)
            continue;
        await DailyProblem.create({
            date: today,
            skill,
            problem: candidates[0]._id,
        });
    }
};
//# sourceMappingURL=dailyAssignment.js.map