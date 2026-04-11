import express from "express";
import Event from "../models/Event.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Create event with image (admin only)
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      image: req.file ? req.file.path : "",
    };
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all events (public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single event (public)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event with image (admin only)
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete event (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RSVP to event (logged in users)
router.post("/:id/rsvp", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.attendees.includes(req.user.id))
      return res.status(400).json({ message: "Already RSVP'd" });
    event.attendees.push(req.user.id);
    await event.save();
    res.json({ message: "RSVP successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;