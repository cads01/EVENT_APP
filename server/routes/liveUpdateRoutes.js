import express from "express";
import LiveUpdate from "../models/LiveUpdate.js";
import { verifyToken, requireOrganizer } from "../middleware/auth.js";
import { broadcast } from "../config/supabase.js";

const router = express.Router();

router.get("/:eventId", async (req, res) => {
  try {
    const updates = await LiveUpdate.find({
      event: req.params.eventId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).populate("postedBy", "name").sort({ createdAt: -1 }).limit(50);
    res.json(updates);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const update = await LiveUpdate.create({
      event: req.params.eventId,
      message: req.body.message,
      type: req.body.type || "info",
      postedBy: req.user.id,
      expiresAt: req.body.expiresAt || null,
    });
    await update.populate("postedBy", "name");
    broadcast("live-updates:" + req.params.eventId, "new-update", update.toObject());
    res.status(201).json(update);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:eventId/:updateId", verifyToken, requireOrganizer, async (req, res) => {
  try {
    await LiveUpdate.findByIdAndDelete(req.params.updateId);
    res.json({ message: "Update deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── VIP Chat (in-memory for simplicity) ─────────────────────────────────
let vipMessages = {};

router.get("/:eventId/vip-chat", async (req, res) => {
  res.json(vipMessages[req.params.eventId] || []);
});

router.post("/:eventId/vip-chat", verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });
  const user = await (await import("../models/User.js")).default.findById(req.user.id).select("name email");
  const msg = { _id: Date.now().toString(), message, user: { _id: user._id, name: user.name }, createdAt: new Date() };
  if (!vipMessages[req.params.eventId]) vipMessages[req.params.eventId] = [];
  vipMessages[req.params.eventId].push(msg);
  if (vipMessages[req.params.eventId].length > 100) vipMessages[req.params.eventId].shift();
  broadcast("vip-chat:" + req.params.eventId, "new-message", msg);
  res.status(201).json(msg);
});

export default router;
