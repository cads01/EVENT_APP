import express from "express";
import CheckIn from "../models/CheckIn.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { verifyToken, requireOrganizer } from "../middleware/auth.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

router.post("/scan", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const { ticketCode, eventId } = req.body;
    const ticket = await Ticket.findOne({ ticketCode, event: eventId }).populate("user", "name email");
    if (!ticket) return res.status(404).json({ message: "Invalid ticket code" });
    if (ticket.status === "cancelled") return res.status(400).json({ message: "Ticket has been cancelled" });
    if (ticket.status === "used") return res.status(400).json({ message: "Ticket already used" });

    const existing = await CheckIn.findOne({ ticket: ticket._id });
    if (existing) return res.status(400).json({ message: "Already checked in" });

    ticket.status = "used";
    await ticket.save();

    const checkin = await CheckIn.create({
      ticket: ticket._id,
      event: ticket.event,
      user: ticket.user,
      scannedBy: req.user.id,
    });

    var ev = await Event.findById(ticket.event);

    createNotification(ticket.user, {
      type: "update",
      title: "Checked In",
      message: "You checked in to " + (ev ? ev.title : "the event"),
      eventId: ticket.event,
      link: "/events/" + ticket.event,
    });

    var userId = ticket.user._id ? ticket.user._id.toString() : ticket.user.toString();
    var user = await User.findById(userId);
    var newBadges = [];
    if (user) {
      var ticketCount = await Ticket.countDocuments({ user: userId, status: { $ne: "cancelled" } });
      if (ticketCount >= 10 && !user.badges.includes("super_fan")) {
        user.badges.push("super_fan");
        newBadges.push("super_fan");
      }
      var tickets = await Ticket.find({ user: userId, status: { $ne: "cancelled" } }).populate("event", "location");
      var locations = [...new Set(tickets.filter(function(t) { return t.event && t.event.location }).map(function(t) { return t.event.location }))];
      if (locations.length >= 3 && !user.badges.includes("globe_trotter")) {
        user.badges.push("globe_trotter");
        newBadges.push("globe_trotter");
      }
      if (newBadges.length > 0) {
        await user.save();
      }
      for (var b of newBadges) {
        createNotification(userId, {
          type: "badge",
          title: "Badge Earned: " + b,
          message: "Congratulations! You earned the " + b.replace(/_/g, " ") + " badge!",
          eventId: ticket.event,
        });
      }
    }

    res.json({
      message: "Check-in successful",
      user: ticket.user,
      ticketCode: ticket.ticketCode,
      newBadges: newBadges,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:eventId/stats", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const [total, checkedIn] = await Promise.all([
      Ticket.countDocuments({ event: req.params.eventId, status: { $ne: "cancelled" } }),
      CheckIn.countDocuments({ event: req.params.eventId }),
    ]);
    const event = await Event.findById(req.params.eventId);
    res.json({
      totalTickets: total,
      checkedIn,
      capacity: event?.capacity || 0,
      fillRate: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
