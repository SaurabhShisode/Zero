import { Schema, model, Types } from "mongoose";

export interface IBookmark {
    user: Types.ObjectId;
    problem: Types.ObjectId;
    collection?: string; // e.g., "Interview Prep", "System Design"
    tags?: string[]; // Custom tags for organization
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
        collection: { type: String, default: "Default" },
        tags: { type: [String], default: [] },
        notes: String,
    },
    { timestamps: true }
);

bookmarkSchema.index({ user: 1, problem: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, collection: 1 });
bookmarkSchema.index({ user: 1, tags: 1 });

export const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);
