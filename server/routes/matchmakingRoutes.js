import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:eventId", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.matchmakingEnabled) return res.json({ enabled: false, matches: [] });

    const currentUser = await User.findById(req.user.id);
    const soloAttendees = await User.find({
      _id: { $in: event.attendees, $ne: req.user.id },
      "preferences.soloMode": true,
    }).select("name email preferences.categories");

    const matches = soloAttendees
      .filter(u => {
        if (!currentUser.preferences?.categories?.length || !u.preferences?.categories?.length) return true;
        return u.preferences.categories.some(c => currentUser.preferences.categories.includes(c));
      })
      .map(u => ({ _id: u._id, name: u.name }));

    res.json({ enabled: true, matches });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/:eventId/toggle", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.preferences.soloMode = !user.preferences.soloMode;
    await user.save();
    res.json({ soloMode: user.preferences.soloMode });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
