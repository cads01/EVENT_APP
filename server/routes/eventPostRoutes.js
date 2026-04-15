// routes/eventPostRoutes.js
import express from "express";
import EventPost from "../models/EventPost.js";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "event-app/posts" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// Create post (with multiple images)
router.post("/:eventId/posts", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { caption } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.attendees.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({ message: "Only RSVP'd attendees can create picture posts" });
    }

    const ticket = await Ticket.findOne({
      event: eventId,
      user: req.user.id,
      status: { $in: ["active", "used"] }
    });
    if (!ticket) {
      return res.status(403).json({ message: "Only ticket holders can create picture posts" });
    }

    const now = new Date();
    if (now < new Date(event.date) && ticket.status !== "used") {
      return res.status(403).json({ message: "You must check in before the event starts to share photos early." });
    }

    const authorPostCount = await EventPost.countDocuments({
      event: eventId,
      author: req.user.id,
      status: { $in: ["pending", "approved"] }
    });
    if (authorPostCount >= 3) {
      return res.status(400).json({ message: "You have reached the maximum of 3 posts for this event." });
    }

    // Upload all images
    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    const post = await EventPost.create({
      event: eventId,
      author: req.user.id,
      images: imageUrls,
      caption,
      status: event.requiresModeration ? "pending" : "approved"
    });

    // Increment event's post count only if post is auto-approved
    if (!event.requiresModeration) {
      await Event.findByIdAndUpdate(eventId, { $inc: { posts: 1 } });
    }

    await post.populate("author", "name email");
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all approved posts for an event
router.get("/:eventId/posts", async (req, res) => {
  try {
    const { eventId } = req.params;
    const posts = await EventPost.find({ event: eventId, status: "approved" })
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Report a post
router.post("/:eventId/posts/:postId/report", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, message } = req.body;
    if (!reason) return res.status(400).json({ message: "Report reason required" });

    const post = await EventPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.reports.some(r => r.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "You have already reported this post" });
    }

    post.reports.push({
      user: req.user.id,
      reason,
      message,
      createdAt: new Date()
    });
    await post.save();

    res.json({ message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending posts for moderation
router.get("/:eventId/posts/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const posts = await EventPost.find({ event: eventId, status: "pending" })
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .populate("reports.user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Moderate a post
router.put("/:eventId/posts/:postId/moderate", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { eventId, postId } = req.params;
    const { action, rejectionReason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Moderation action must be approve or reject" });
    }

    const post = await EventPost.findById(postId);
    if (!post || post.event.toString() !== eventId) {
      return res.status(404).json({ message: "Post not found" });
    }

    const wasApproved = post.status === "approved";
    post.status = action === "approve" ? "approved" : "rejected";
    post.reviewedBy = req.user.id;
    post.reviewedAt = new Date();
    post.rejectionReason = action === "reject" ? rejectionReason || "Rejected by moderator" : "";
    await post.save();

    if (!wasApproved && post.status === "approved") {
      await Event.findByIdAndUpdate(eventId, { $inc: { posts: 1 } });
    }
    if (wasApproved && post.status === "rejected") {
      await Event.findByIdAndUpdate(eventId, { $inc: { posts: -1 } });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like a post
router.post("/:eventId/posts/:postId/like", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await EventPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likedBy.includes(req.user.id);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== req.user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user.id);
      post.likes += 1;
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment to post
router.post("/:eventId/posts/:postId/comment", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const post = await EventPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });
    await post.save();
    await post.populate("comments.user", "name email");
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
