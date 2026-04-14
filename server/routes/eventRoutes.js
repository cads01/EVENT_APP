import express from "express";
import Event from "../models/Event.js";
import DeletedEvent from "../models/DeletedEvent.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";
import { sendRSVPConfirmation } from "../config/email.js";

const router = express.Router();

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "event-app" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// ─── Create event (admin only) ───────────────────────────────────────────────
router.post("/", verifyToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id,
      image: imageUrl,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get all events (public) ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Recycle bin — get deleted events (admin only) ───────────────────────────
router.get("/trash", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeletedEvent.find()
      .populate("deletedBy", "name email")
      .populate("createdBy", "name email")
      .sort({ deletedAt: -1 });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Restore event from recycle bin (admin only) ─────────────────────────────
router.post("/trash/:id/restore", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeletedEvent.findById(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found in trash" });

    // Re-create event from snapshot
    const restored = await Event.create({
      title:       deleted.title,
      description: deleted.description,
      date:        deleted.date,
      location:    deleted.location,
      venue:       deleted.venue,
      image:       deleted.image,
      price:       deleted.price,
      capacity:    deleted.capacity,
      attendees:   deleted.attendees,
      createdBy:   deleted.createdBy,
    });

    // Remove from trash
    await DeletedEvent.findByIdAndDelete(req.params.id);

    res.json({ message: "Event restored successfully", event: restored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Permanently delete from trash (admin only) ──────────────────────────────
router.delete("/trash/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await DeletedEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get single event (public) ───────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get event attendees (admin only) ────────────────────────────────────────
router.get("/:id/attendees", verifyToken, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("attendees", "name email createdAt");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ title: event.title, attendees: event.attendees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update event (admin only) ───────────────────────────────────────────────
router.put("/:id", verifyToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = await uploadToCloudinary(req.file.buffer);
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Soft delete — moves to recycle bin (admin only) ─────────────────────────
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Snapshot into DeletedEvent before removing
    await DeletedEvent.create({
      title:       event.title,
      description: event.description,
      date:        event.date,
      location:    event.location,
      venue:       event.venue,
      image:       event.image,
      price:       event.price,
      capacity:    event.capacity,
      attendees:   event.attendees,
      createdBy:   event.createdBy,
      deletedBy:   req.user.id,
      deletedAt:   new Date(),
      expiresAt:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event moved to recycle bin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RSVP to event (logged in users) ─────────────────────────────────────────
router.post("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.attendees.includes(req.user.id))
      return res.status(400).json({ message: "Already RSVP'd" });

    event.attendees.push(req.user.id);
    await event.save();

    const user = await (await import("../models/User.js")).default.findById(req.user.id);
    try {
      await sendRSVPConfirmation({
        to: user.email,
        name: user.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    res.json({ message: "RSVP successful! Check your email for confirmation." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Cancel RSVP (logged in users) ───────────────────────────────────────────
router.delete("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.attendees = event.attendees.filter(
      a => a.toString() !== req.user.id
    );
    await event.save();
    res.json({ message: "RSVP cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
