import { Schema, model, Document, Types } from "mongoose";
const solveSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["solved", "wrong", "skipped"], required: true },
    placementMode: { type: Boolean, default: false },
    approachNote: String,
}, { timestamps: true });
solveSchema.index({ user: 1, problem: 1, date: 1 }, { unique: true });
export const Solve = model("Solve", solveSchema);
//# sourceMappingURL=Solve.js.map