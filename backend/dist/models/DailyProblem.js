import { Schema, model, Document, Types } from "mongoose";
import { Skills } from "./common.js";
const dailyProblemSchema = new Schema({
    date: { type: Date, required: true, index: true },
    skill: { type: String, enum: Skills, required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    assignedAt: { type: Date, default: Date.now },
}, { timestamps: true });
dailyProblemSchema.index({ date: 1, skill: 1 }, { unique: true });
export const DailyProblem = model("DailyProblem", dailyProblemSchema);
//# sourceMappingURL=DailyProblem.js.map