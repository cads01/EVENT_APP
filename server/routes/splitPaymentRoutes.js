import express from "express";
import SplitPayment from "../models/SplitPayment.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/:eventId/create", verifyToken, async (req, res) => {
  try {
    const { participants, totalAmount } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const share = Math.round(totalAmount / participants.length);
    const split = await SplitPayment.create({
      event: req.params.eventId,
      creator: req.user.id,
      totalAmount,
      participants: participants.map(p => ({ ...p, share })),
    });
    res.status(201).json(split);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId/split/:splitId/pay", verifyToken, async (req, res) => {
  try {
    const split = await SplitPayment.findById(req.params.splitId);
    if (!split) return res.status(404).json({ message: "Split not found" });

    const participant = split.participants.find(
      p => p.user?.toString() === req.user.id || p.email === req.user.email
    );
    if (!participant) return res.status(403).json({ message: "Not a participant" });
    if (participant.status === "paid") return res.status(400).json({ message: "Already paid" });

    participant.status = "paid";
    participant.paidAt = new Date();
    participant.transactionRef = req.body.transactionRef;

    const allPaid = split.participants.every(p => p.status === "paid");
    split.status = allPaid ? "completed" : "partially_paid";
    await split.save();

    if (allPaid && req.body.issueTickets) {
      for (const p of split.participants) {
        if (p.user) {
          await Ticket.create({ event: split.event, user: p.user, paidAmount: p.share });
        }
      }
    }

    res.json(split);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:eventId/splits/mine", verifyToken, async (req, res) => {
  try {
    const splits = await SplitPayment.find({
      event: req.params.eventId,
      $or: [{ creator: req.user.id }, { "participants.user": req.user.id }],
    }).populate("creator", "name email").populate("participants.user", "name email");
    res.json(splits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
