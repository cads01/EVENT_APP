// models/EventPost.js
import mongoose from "mongoose";

const eventPostSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [{ type: String }], // Array of image URLs
  caption: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
    message: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  }],
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  rejectionReason: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("EventPost", eventPostSchema);
