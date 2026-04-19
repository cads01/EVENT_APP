import { config } from "dotenv";
config({ path: "./.env" });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import eventPostRoutes from "./routes/eventPostRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import { startReminderJob } from "./jobs/reminderJob.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// middleware
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", eventPostRoutes);
app.use("/api/events", donationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);

// DB + startup
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connected");
    startReminderJob(); // ← start cron after DB is ready
  })
  .catch((err) => console.error("DB connection failed:", err.message));

app.listen(5000, () => console.log("Server running on port 5000"));
