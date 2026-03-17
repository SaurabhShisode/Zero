import { Schema, model, Types } from "mongoose";

export interface IBookmark {
    user: Types.ObjectId;
    problem: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    },
    { timestamps: true }
);

bookmarkSchema.index({ user: 1, problem: 1 }, { unique: true });

export const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);
