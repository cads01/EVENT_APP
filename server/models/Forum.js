import mongoose from "mongoose";

const forumThreadSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pinned: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const forumPostSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: "ForumThread", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const ForumThread = mongoose.model("ForumThread", forumThreadSchema);
export const ForumPost = mongoose.model("ForumPost", forumPostSchema);
