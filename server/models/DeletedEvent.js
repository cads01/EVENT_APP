// models/DeletedEvent.js
import mongoose from "mongoose";

const deletedEventSchema = new mongoose.Schema({
  // Full snapshot of the event at time of deletion
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date },
  location:    { type: String },
  venue: {
    address: { type: String, default: "" },
    lat:     { type: Number, default: null },
    lng:     { type: Number, default: null },
  },
  image:       { type: String, default: "" },
  price:       { type: Number, default: 0 },
  capacity:    { type: Number, default: 100 },
  attendees:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Recycle bin metadata
  deletedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt:   { type: Date, default: Date.now },

  // MongoDB TTL index — document auto-deletes 30 days after deletedAt
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 },
  },
}, { timestamps: false });

export default mongoose.model("DeletedEvent", deletedEventSchema);
