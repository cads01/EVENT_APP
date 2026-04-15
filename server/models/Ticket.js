// models/Ticket.js
import mongoose from "mongoose";
import crypto from "crypto";

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    unique: true,
    default: () => "TKT-" + crypto.randomBytes(5).toString("hex").toUpperCase(),
  },
  event:  { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  status: { type: String, enum: ["active", "cancelled", "used"], default: "active" },
  paidAmount: { type: Number, default: 0 },
  issuedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent duplicate tickets for the same user+event
ticketSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("Ticket", ticketSchema);
