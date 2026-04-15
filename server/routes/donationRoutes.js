// routes/donationRoutes.js
import express from "express";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create donation intent
router.post("/:eventId/donate", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { amount, message } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    const donation = await Donation.create({
      event: eventId,
      donor: req.user.id,
      amount,
      message,
      status: "pending"
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Confirm donation (after Paystack callback)
router.post("/:eventId/donations/:donationId/confirm", verifyToken, async (req, res) => {
  try {
    const { donationId, eventId } = req.params;
    const { transactionRef } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = "completed";
    donation.transactionRef = transactionRef;
    await donation.save();

    // Update event donations total
    await Event.findByIdAndUpdate(eventId, { $inc: { donations: donation.amount } });

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get donations for event
router.get("/:eventId/donations", async (req, res) => {
  try {
    const { eventId } = req.params;
    const donations = await Donation.find({ event: eventId, status: "completed" })
      .populate("donor", "name email")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
