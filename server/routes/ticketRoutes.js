// routes/ticketRoutes.js
import express from "express";
import Ticket from "../models/Ticket.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/tickets/mine — all tickets for logged-in user
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate("event", "title date location image eventType hostImage price venue createdBy")
      .populate({ path: "event", populate: { path: "createdBy", select: "name email" } })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/:id — single ticket
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("event", "title date location image eventType hostImage price venue createdBy")
      .populate({ path: "event", populate: { path: "createdBy", select: "name email" } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your ticket" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
