// models/Donation.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  message: { type: String, default: "" },
  transactionRef: { type: String },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Donation", donationSchema);
