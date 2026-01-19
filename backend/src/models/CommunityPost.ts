import mongoose, { Schema, Document } from "mongoose"

export interface ICommunityPost extends Document {
  title: string
  body: string
  author: mongoose.Types.ObjectId
  upvotes: mongoose.Types.ObjectId[]
  downvotes: mongoose.Types.ObjectId[]
  commentsCount: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
      }
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

export default mongoose.model<ICommunityPost>(
  "CommunityPost",
  CommunityPostSchema
)
