import mongoose, { Schema, Document } from "mongoose"

export interface ICommunityComment extends Document {
  post: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  message: string
  createdAt: Date
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<ICommunityComment>(
  "CommunityComment",
  CommunityCommentSchema
)
