import { Schema, model, Document, Types } from "mongoose";
const revisionTaskSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    scheduledFor: { type: Date, required: true, index: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
}, { timestamps: true });
revisionTaskSchema.index({ user: 1, problem: 1, scheduledFor: 1 }, { unique: true });
export const RevisionTask = model("RevisionTask", revisionTaskSchema);
//# sourceMappingURL=RevisionTask.js.map