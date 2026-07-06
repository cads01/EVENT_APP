import express from "express";
import { ForumThread, ForumPost } from "../models/Forum.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:eventId/threads", async (req, res) => {
  try {
    const threads = await ForumThread.find({ event: req.params.eventId })
      .populate("author", "name email")
      .sort({ pinned: -1, createdAt: -1 });
    res.json(threads);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId/threads", verifyToken, async (req, res) => {
  try {
    const thread = await ForumThread.create({
      event: req.params.eventId,
      title: req.body.title,
      author: req.user.id,
    });
    await thread.populate("author", "name email");
    res.status(201).json(thread);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:eventId/threads/:threadId/posts", async (req, res) => {
  try {
    const posts = await ForumPost.find({ thread: req.params.threadId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId/threads/:threadId/posts", verifyToken, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    if (thread.locked) return res.status(403).json({ message: "Thread is locked" });
    const post = await ForumPost.create({
      thread: req.params.threadId,
      event: req.params.eventId,
      author: req.user.id,
      content: req.body.content,
    });
    await post.populate("author", "name email");
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId/posts/:postId/upvote", verifyToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const idx = post.upvotes.indexOf(req.user.id);
    if (idx > -1) post.upvotes.splice(idx, 1);
    else post.upvotes.push(req.user.id);
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
