import { Schema, model, Document, Types } from "mongoose";
const discussionSchema = new Schema({
    dailyProblem: {
        type: Schema.Types.ObjectId,
        ref: "DailyProblem",
        required: true,
        index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
}, { timestamps: true });
export const DiscussionComment = model("DiscussionComment", discussionSchema);
//# sourceMappingURL=Discussion.js.map