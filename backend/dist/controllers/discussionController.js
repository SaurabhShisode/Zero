import { DiscussionComment } from "../models/Discussion.js";
export const listComments = async (req, res) => {
    const dailyProblemId = req.params.dailyProblemId;
    if (!dailyProblemId)
        return res.status(400).json({ message: "dailyProblemId required" });
    const comments = await DiscussionComment.find({ dailyProblem: dailyProblemId })
        .populate("user", "name")
        .sort({ createdAt: 1 });
    return res.json({ comments });
};
export const addComment = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const dailyProblemId = req.params.dailyProblemId;
    if (!dailyProblemId)
        return res.status(400).json({ message: "dailyProblemId required" });
    const { message } = req.body;
    if (!message)
        return res.status(400).json({ message: "Message required" });
    const comment = await DiscussionComment.create({
        dailyProblem: dailyProblemId,
        user: req.userId,
        message,
    });
    return res.status(201).json({ comment });
};
//# sourceMappingURL=discussionController.js.map