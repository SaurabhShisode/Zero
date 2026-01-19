import mongoose, { Schema, Document } from "mongoose"

export interface IBug extends Document {
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "fixed"
  author: mongoose.Types.ObjectId
  createdAt: Date
}

const BugSchema = new Schema<IBug>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "fixed"],
      default: "open"
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IBug>("Bug", BugSchema)
