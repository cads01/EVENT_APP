import { config } from "dotenv";
config({ path: "./.env" }); // ✅ fixed path

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(cors({
  origin: "*",
  credentials: false
}));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(express.json()); // ✅ moved before routes

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error("DB connection failed:", err.message)); // ✅ added catch

app.listen(5000, () => console.log("Server running"))