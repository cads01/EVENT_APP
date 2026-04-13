// routes/adminRoutes.js
// Mount this in server.js: app.use("/api/admin", adminRoutes)
import express from "express";
import { sendReminders } from "../jobs/reminderJob.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/admin/send-reminders
// Admin-only route to manually trigger reminder emails (useful for testing)
router.post("/send-reminders", verifyToken, requireAdmin, async (req, res) => {
  try {
    await sendReminders();
    res.json({ success: true, message: "Reminders sent successfully" });
  } catch (err) {
    console.error("Manual reminder trigger failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
