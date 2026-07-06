import express from "express";
import Notification from "../models/Notification.js";
import Event from "../models/Event.js";
import { verifyToken, requireOrganizer } from "../middleware/auth.js";
import { broadcast } from "../config/supabase.js";
import { sendBroadcastEmail } from "../config/email.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("event", "title image")
      .sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    res.json(n);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: "All marked read" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/broadcast", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const { eventId, title, message, type } = req.body;
    const Ticket = (await import("../models/Ticket.js")).default;
    const tickets = await Ticket.find({ event: eventId, status: "active" }).distinct("user");
    const notifications = tickets.map(user => ({
      user, event: eventId, title, message, type: type || "announcement",
    }));
    const created = await Notification.insertMany(notifications);
    for (const n of created) {
      broadcast("notifications:" + n.user, "new-notification", n.toObject());
    }
    res.json({ count: notifications.length, message: "Broadcast sent" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/remind/:eventId", verifyToken, requireOrganizer, async (req, res) => {
  try {
    var event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    var Ticket = (await import("../models/Ticket.js")).default;
    var userIds = await Ticket.find({ event: req.params.eventId, status: "active" }).distinct("user");
    if (userIds.length === 0) return res.json({ message: "No ticket holders to remind" });
    var notifications = userIds.map(function(u) {
      return {
        user: u,
        event: req.params.eventId,
        type: "reminder",
        title: "Event Reminder: " + event.title,
        message: event.title + " is coming up! " + new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric" }),
        link: "/events/" + req.params.eventId,
      };
    });
    var created = await Notification.insertMany(notifications);
    for (var n of created) {
      broadcast("notifications:" + n.user, "new-notification", n.toObject());
    }
    res.json({ count: notifications.length, message: "Reminder sent to " + notifications.length + " attendees" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/broadcast-email", verifyToken, requireOrganizer, async (req, res) => {
  try {
    var { eventId, subject, message } = req.body;
    if (!eventId || !message) return res.status(400).json({ message: "eventId and message required" });
    var event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    var Ticket = (await import("../models/Ticket.js")).default;
    var tickets = await Ticket.find({ event: eventId, status: "active" }).populate("user", "name email");
    var recipients = tickets.map(function(t) { return { email: t.user.email, name: t.user.name } }).filter(function(r) { return r.email });
    if (recipients.length === 0) return res.json({ message: "No ticket holders to email" });
    await sendBroadcastEmail({ eventTitle: event.title, subject: subject || "Update: " + event.title, message: message, recipients: recipients });
    res.json({ count: recipients.length, message: "Email sent to " + recipients.length + " attendees" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
