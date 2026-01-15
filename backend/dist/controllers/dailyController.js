import { DailyProblem } from "../models/DailyProblem.js";
import { User } from "../models/User.js";
import { toDay } from "../utils/dates.js";
export const getDaily = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.userId);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const enabledSkills = user.preferences.filter((p) => p.enabled).map((p) => p.skill);
    const today = toDay();
    const daily = await DailyProblem.find({
        date: today,
        skill: { $in: enabledSkills },
    }).populate("problem");
    return res.json({ daily });
};
//# sourceMappingURL=dailyController.js.map