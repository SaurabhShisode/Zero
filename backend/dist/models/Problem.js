import { Schema, model, Document } from "mongoose";
import { Skills } from "./common.js";
const problemSchema = new Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    skill: { type: String, enum: Skills, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    companyTags: { type: [String], default: [] },
    cooldownDays: { type: Number, default: 14 },
}, { timestamps: true });
export const Problem = model("Problem", problemSchema);
//# sourceMappingURL=Problem.js.map