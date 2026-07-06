import express from "express";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import { sendReminders } from "../jobs/reminderJob.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-reminders", verifyToken, requireAdmin, async (req, res) => {
  try {
    await sendReminders();
    res.json({ success: true, message: "Reminders sent successfully" });
  } catch (err) {
    console.error("Manual reminder trigger failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    var q = {};
    if (req.query.search) {
      var s = req.query.search;
      q.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }
    var users = await User.find(q).select("-password").sort({ createdAt: -1 }).limit(200);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch("/users/:id/role", verifyToken, requireAdmin, async (req, res) => {
  try {
    var { role } = req.body;
    if (!["user", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    var user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/users/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/blogs", verifyToken, requireAdmin, async (req, res) => {
  try {
    var blogs = await Blog.find().populate("author", "name email").sort({ createdAt: -1 }).limit(100);
    res.json(blogs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/blogs/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
