import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { startReminderJob } from "./jobs/reminderJob.js";

const app = express();

// middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());

// routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// validate env
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in environment variables");
}

// DB + startup
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");

    try {
      startReminderJob();
      console.log("Reminder job started");
    } catch (err) {
      console.error("Cron job failed:", err.message);
    }
  })
  .catch((err) => console.error("DB connection failed:", err.message));

// port fix for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});