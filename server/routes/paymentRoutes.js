import crypto from "crypto";
import express from "express";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { sendRSVPConfirmation } from "../config/email.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

function verifySignature(req, res, buf) {
  const sig = req.headers["x-paystack-signature"];
  if (!sig) return false;
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(buf).digest("hex");
  return hash === sig;
}

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!verifySignature(req, null, req.body)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    if (event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = payload.data;
    const metadata = data.metadata || {};
    const eventId = metadata.event_id;
    const userId = metadata.user_id;

    if (!eventId || !userId) {
      return res.status(400).json({ message: "Missing event_id or user_id in metadata" });
    }

    const existing = await Ticket.findOne({ event: eventId, user: userId });
    if (existing) {
      return res.json({ message: "Ticket already issued" });
    }

    const ev = await Event.findById(eventId);
    if (!ev) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!ev.attendees.includes(userId)) {
      ev.attendees.push(userId);
      await ev.save();
    }

    const ticket = await Ticket.create({
      event: eventId,
      user: userId,
      paidAmount: (data.amount || 0) / 100,
    });

    try {
      const user = await User.findById(userId);
      if (user) {
        await sendRSVPConfirmation({
          to: user.email,
          name: user.name,
          eventTitle: ev.title,
          eventDate: ev.date,
          eventLocation: ev.location,
          ticketCode: ticket.ticketCode,
        });
      }
    } catch (emailErr) {
      console.error("[Webhook] Email failed:", emailErr.message);
    }

    createNotification(userId, {
      type: "update",
      title: "Payment Confirmed",
      message: "Your payment for " + ev.title + " was successful",
      eventId: ev._id,
      link: "/events/" + ev._id,
    });

    res.json({ message: "Payment confirmed, ticket issued", ticketCode: ticket.ticketCode });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    res.sendStatus(500);
  }
});

export default router;
