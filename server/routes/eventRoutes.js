// routes/eventRoutes.js
import express from "express";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import DeletedEvent from "../models/DeletedEvent.js";
import User from "../models/User.js";
import { verifyToken, requireAdmin, requireOrganizer } from "../middleware/auth.js";
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

// ─── Create event (admin or organizer) ───────────────────────────────────────
router.post("/", verifyToken, requireOrganizer, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);
    const event = await Event.create({
      ...req.body, createdBy: req.user.id, image: imageUrl,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get all events (public) ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email role");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin dashboard stats ────────────────────────────────────────────────────
router.get("/admin/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const [totalEvents, totalUsers, totalTickets, events] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Ticket.countDocuments({ status: "active" }),
      Event.find().populate("createdBy", "name email role").sort({ date: -1 }),
    ]);

    const ongoing  = events.filter(e => {
      const d = new Date(e.date);
      return d >= now && d <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
    });
    const upcoming = events.filter(e =>
      new Date(e.date) > new Date(now.getTime() + 24 * 60 * 60 * 1000)
    );
    const past = events.filter(e => new Date(e.date) < now);

    const revenueAgg = await Ticket.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    res.json({
      totalEvents, totalUsers, totalTickets,
      totalRevenue: revenueAgg[0]?.total || 0,
      ongoing: ongoing.length,
      upcoming: upcoming.length,
      past: past.length,
      ongoingEvents: ongoing,
      upcomingEvents: upcoming.slice(0, 5),
      pastEvents: past.slice(0, 5),
      recentEvents: events.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Organizer: my events with ticket data ────────────────────────────────────
router.get("/organizer/my-events", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ createdBy: req.user.id }).sort({ date: -1 });
    const enriched = await Promise.all(events.map(async (e) => {
      const tickets = await Ticket.find({ event: e._id })
        .populate("user", "name email");
      const status =
        new Date(e.date) < now ? "past" :
        new Date(e.date) <= new Date(now.getTime() + 24 * 60 * 60 * 1000) ? "ongoing" :
        "upcoming";
      return { ...e.toObject(), tickets, status };
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Recycle bin (admin only) ─────────────────────────────────────────────────
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

router.post("/trash/:id/restore", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeletedEvent.findById(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found in trash" });
    const restored = await Event.create({
      title: deleted.title, description: deleted.description,
      date: deleted.date, timezone: deleted.timezone, location: deleted.location,
      venue: deleted.venue, image: deleted.image,
      price: deleted.price, capacity: deleted.capacity,
      attendees: deleted.attendees, createdBy: deleted.createdBy,
    });
    await DeletedEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Event restored", event: restored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/trash/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await DeletedEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get single event ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email role");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get attendees + ticket codes ────────────────────────────────────────────
router.get("/:id/attendees", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role === "organizer" &&
        event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });

    const tickets = await Ticket.find({ event: req.params.id })
      .populate("user", "name email createdAt");

    res.json({
      title: event.title,
      attendees: tickets.map(t => ({
        _id: t.user._id,
        name: t.user.name,
        email: t.user.email,
        ticketCode: t.ticketCode,
        status: t.status,
        issuedAt: t.issuedAt,
        paidAmount: t.paidAmount,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get current user's ticket status ─────────────────────────────────────────
router.get("/:id/ticket", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ event: req.params.id, user: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ status: ticket.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Check in attendee before the event starts ─────────────────────────────────
router.post("/:id/checkin", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.attendees.some(a => a.toString() === req.user.id)) {
      return res.status(403).json({ message: "Only RSVP'd attendees can check in" });
    }

    const ticket = await Ticket.findOne({ event: req.params.id, user: req.user.id, status: "active" });
    if (!ticket) return res.status(400).json({ message: "No active ticket found for check-in" });

    ticket.status = "used";
    await ticket.save();
    res.json({ message: "Checked in successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update event ─────────────────────────────────────────────────────────────
router.put("/:id", verifyToken, requireOrganizer, upload.single("image"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role === "organizer" && event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });
    const updateData = { ...req.body };
    if (req.file) updateData.image = await uploadToCloudinary(req.file.buffer);
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Soft delete → recycle bin ───────────────────────────────────────────────
router.delete("/:id", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role === "organizer" && event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });
    await DeletedEvent.create({
      ...event.toObject(), _id: undefined,
      deletedBy: req.user.id, deletedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event moved to recycle bin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RSVP — generates ticket ──────────────────────────────────────────────────
router.post("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const { specialCode } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.attendees.includes(req.user.id))
      return res.status(400).json({ message: "Already RSVP'd" });
    if (event.attendees.length >= event.capacity)
      return res.status(400).json({ message: "Event is at full capacity" });

    // Check special code if required
    if (event.specialCode && event.specialCode.trim()) {
      if (!specialCode || specialCode.trim() !== event.specialCode.trim()) {
        return res.status(403).json({ message: "Invalid or missing special access code" });
      }
    }

    event.attendees.push(req.user.id);
    await event.save();

    const ticket = await Ticket.create({
      event: event._id,
      user: req.user.id,
      paidAmount: event.price || 0,
    });

    const user = await User.findById(req.user.id);
    try {
      await sendRSVPConfirmation({
        to: user.email, name: user.name,
        eventTitle: event.title, eventDate: event.date,
        eventLocation: event.location, ticketCode: ticket.ticketCode,
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    res.json({
      message: "RSVP successful! Check your email for your ticket.",
      ticketCode: ticket.ticketCode,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Cancel RSVP ──────────────────────────────────────────────────────────────
router.delete("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.attendees = event.attendees.filter(a => a.toString() !== req.user.id);
    await event.save();
    await Ticket.findOneAndUpdate(
      { event: req.params.id, user: req.user.id },
      { status: "cancelled" }
    );
    res.json({ message: "RSVP cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Add comment to event ──────────────────────────────────────────────────────
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });
    await event.save();
    await event.populate("comments.user", "name email");
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get comments for event ───────────────────────────────────────────────────
router.get("/:id/comments", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("comments.user", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
