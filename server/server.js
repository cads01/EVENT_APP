import { config } from "dotenv";
config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import liveUpdateRoutes from "./routes/liveUpdateRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import splitPaymentRoutes from "./routes/splitPaymentRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import matchmakingRoutes from "./routes/matchmakingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventPostRoutes from "./routes/eventPostRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { startReminderJob } from "./jobs/reminderJob.js";

const app = express();

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth",           authRoutes);
app.use("/api/events",         eventRoutes);
app.use("/api/tickets",        ticketRoutes);
app.use("/api/admin",          adminRoutes);
app.use("/api/forum",          forumRoutes);
app.use("/api/live-updates",   liveUpdateRoutes);
app.use("/api/checkin",        checkinRoutes);
app.use("/api/split-payments", splitPaymentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/matchmaking",    matchmakingRoutes);
app.use("/api/notifications",  notificationRoutes);
app.use("/api/events", eventPostRoutes);
app.use("/api/events", donationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    startReminderJob();
  })
  .catch(err => console.error("DB connection failed:", err.message));

app.listen(5000, () => console.log("Server running on port 5000"));
