// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  timezone: { type: String, default: "UTC" },
  location: { type: String, required: true },
  venue: {
    address: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  image: { type: String, default: "" },
  price: { type: Number, default: 0 },
  capacity: { type: Number, default: 100 },
  requiresModeration: { type: Boolean, default: false }, // VIP events or special code events require post moderation
  specialCode: { type: String, default: "" }, // Optional special code for exclusive events
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  posts: { type: Number, default: 0 }, // Count of picture posts
  donations: { type: Number, default: 0 }, // Total donations
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
