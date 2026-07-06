import express from "express";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id, status: "active" })
      .populate({ path: "event", select: "eventType" });
    const attendedTypes = tickets.map(t => t.event?.eventType).filter(Boolean);
    const attendedIds = tickets.map(t => t.event?._id).filter(Boolean);

    const typeMatch = attendedTypes.length > 0
      ? await Event.find({
          eventType: { $in: attendedTypes },
          _id: { $nin: attendedIds },
          date: { $gt: new Date() },
        }).populate("createdBy", "name email").limit(6)
      : [];

    const popular = await Event.find({
      _id: { $nin: [...attendedIds, ...typeMatch.map(e => e._id)] },
      date: { $gt: new Date() },
    }).sort({ "attendees.length": -1 }).limit(6).populate("createdBy", "name email");

    res.json({ basedOnHistory: typeMatch, popular });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
