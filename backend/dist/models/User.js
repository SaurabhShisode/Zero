import { Schema, model, Document } from "mongoose";
import { Skills } from "./common.js";
const preferenceSchema = new Schema({
    skill: { type: String, enum: Skills, required: true },
    enabled: { type: Boolean, default: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    preferredLanguage: String,
    timeCommitmentMinutes: Number,
    companyFocus: { type: String, enum: ["FAANG", "Service", "Startups", "Any"] },
}, { _id: false });
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    preferences: { type: [preferenceSchema], default: [] },
    placementMode: { type: Boolean, default: false },
    profileSlug: { type: String, required: true, unique: true },
    streak: {
        current: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        freezeAvailable: { type: Number, default: 1 },
    },
}, { timestamps: true });
export const User = model("User", userSchema);
//# sourceMappingURL=User.js.map