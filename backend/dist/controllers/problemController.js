import { Problem } from "../models/Problem.js";
export const createProblem = async (req, res) => {
    const { title, link, skill, difficulty, companyTags, cooldownDays } = req.body;
    const problem = await Problem.create({
        title,
        link,
        skill,
        difficulty,
        companyTags,
        cooldownDays,
    });
    return res.status(201).json({ problem });
};
export const listProblems = async (_req, res) => {
    const problems = await Problem.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ problems });
};
//# sourceMappingURL=problemController.js.map