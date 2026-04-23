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

// Accept both 'image' and 'hostImage' fields
const multiUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "hostImage", maxCount: 1 },
]);

// ─── Create event ─────────────────────────────────────────────────────────────
router.post("/", verifyToken, requireOrganizer, multiUpload, async (req, res) => {
  try {
    let imageUrl = "", hostImageUrl = "";
    if (req.files?.image?.[0])     imageUrl     = await uploadToCloudinary(req.files.image[0].buffer);
    if (req.files?.hostImage?.[0]) hostImageUrl = await uploadToCloudinary(req.files.hostImage[0].buffer);
    const event = await Event.create({
      ...req.body,
      faq: req.body.faq ? JSON.parse(req.body.faq) : [],
      createdBy: req.user.id,
      image: imageUrl,
      hostImage: hostImageUrl,
    });
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Get all events ───────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email role");
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Admin stats ──────────────────────────────────────────────────────────────
router.get("/admin/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const [totalEvents, totalUsers, totalTickets, events] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Ticket.countDocuments({ status: "active" }),
      Event.find().populate("createdBy", "name email role").sort({ date: -1 }),
    ]);
    const ongoing  = events.filter(e => { const d = new Date(e.date); return d >= now && d <= new Date(now.getTime() + 86400000); });
    const upcoming = events.filter(e => new Date(e.date) > new Date(now.getTime() + 86400000));
    const past     = events.filter(e => new Date(e.date) < now);
    const revenueAgg = await Ticket.aggregate([{ $match: { status: "active" } }, { $group: { _id: null, total: { $sum: "$paidAmount" } } }]);
    res.json({
      totalEvents, totalUsers, totalTickets,
      totalRevenue: revenueAgg[0]?.total || 0,
      ongoing: ongoing.length, upcoming: upcoming.length, past: past.length,
      ongoingEvents: ongoing, upcomingEvents: upcoming.slice(0, 5), pastEvents: past.slice(0, 5),
      recentEvents: events.slice(0, 5),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Organizer: my events ─────────────────────────────────────────────────────
router.get("/organizer/my-events", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ createdBy: req.user.id }).sort({ date: -1 });
    const enriched = await Promise.all(events.map(async (e) => {
      const tickets = await Ticket.find({ event: e._id }).populate("user", "name email");
      const status = new Date(e.date) < now ? "past" : new Date(e.date) <= new Date(now.getTime() + 86400000) ? "ongoing" : "upcoming";
      return { ...e.toObject(), tickets, status };
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Trash ────────────────────────────────────────────────────────────────────
router.get("/trash", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeletedEvent.find().populate("deletedBy", "name email").populate("createdBy", "name email").sort({ deletedAt: -1 });
    res.json(deleted);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/trash/:id/restore", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeletedEvent.findById(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found in trash" });
    const restored = await Event.create({
      title: deleted.title, description: deleted.description, date: deleted.date,
      location: deleted.location, venue: deleted.venue, image: deleted.image,
      hostImage: deleted.hostImage, eventType: deleted.eventType,
      price: deleted.price, capacity: deleted.capacity,
      attendees: deleted.attendees, createdBy: deleted.createdBy,
    });
    await DeletedEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Event restored", event: restored });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/trash/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await DeletedEvent.findByIdAndDelete(req.params.id);
    res.json({ message: "Permanently deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Get single event ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email role");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Get attendees + tickets ──────────────────────────────────────────────────
router.get("/:id/attendees", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role === "organizer" && event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });
    const tickets = await Ticket.find({ event: req.params.id }).populate("user", "name email createdAt");
    res.json({
      title: event.title,
      attendees: tickets.map(t => ({
        _id: t.user._id, name: t.user.name, email: t.user.email,
        ticketCode: t.ticketCode, status: t.status,
        issuedAt: t.issuedAt, paidAmount: t.paidAmount,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Update event ─────────────────────────────────────────────────────────────
router.put("/:id", verifyToken, requireOrganizer, multiUpload, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (req.user.role === "organizer" && event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });
    const updateData = { ...req.body };
    if (req.body.faq) updateData.faq = JSON.parse(req.body.faq);
    if (req.files?.image?.[0])     updateData.image     = await uploadToCloudinary(req.files.image[0].buffer);
    if (req.files?.hostImage?.[0]) updateData.hostImage = await uploadToCloudinary(req.files.hostImage[0].buffer);
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Soft delete → trash ──────────────────────────────────────────────────────
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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── RSVP → generates ticket ──────────────────────────────────────────────────
router.post("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.attendees.includes(req.user.id))
      return res.status(400).json({ message: "Already RSVP'd" });
    if (event.attendees.length >= event.capacity)
      return res.status(400).json({ message: "Event is at full capacity" });

    event.attendees.push(req.user.id);
    await event.save();

    const ticket = await Ticket.create({ event: event._id, user: req.user.id, paidAmount: event.price || 0 });
    const user = await User.findById(req.user.id);
    try {
      await sendRSVPConfirmation({
        to: user.email, name: user.name,
        eventTitle: event.title, eventDate: event.date,
        eventLocation: event.location, ticketCode: ticket.ticketCode,
      });
    } catch (emailErr) { console.error("Email failed:", emailErr.message); }

    res.json({ message: "RSVP successful! Check your email for your ticket.", ticketCode: ticket.ticketCode });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Cancel RSVP ──────────────────────────────────────────────────────────────
router.delete("/:id/rsvp", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.attendees = event.attendees.filter(a => a.toString() !== req.user.id);
    await event.save();
    await Ticket.findOneAndUpdate({ event: req.params.id, user: req.user.id }, { status: "cancelled" });
    res.json({ message: "RSVP cancelled" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
