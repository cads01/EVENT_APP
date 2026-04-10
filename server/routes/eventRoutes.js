// routes/eventRoutes.js
import express from "express";
import Event from "../models/Event.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const event = await Event.create({
    ...req.body,
    createdBy: req.user.id,
  });
  res.json(event);
});

router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

export default router;