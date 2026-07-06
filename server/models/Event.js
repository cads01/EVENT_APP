// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  location:    { type: String, required: true },
  timezone:    { type: String, default: "Africa/Lagos" },
  eventType:   {
    type: String, default: "General",
    enum: ["General","Conference","Wedding","Birthday","Concert",
           "Festival","Corporate","Networking","Sports","Charity",
           "Exhibition","Workshop","Religious","Graduation","Other"]
  },
  venue: {
    address: { type: String, default: "" },
    lat:     { type: Number, default: null },
    lng:     { type: Number, default: null },
  },
  image:              { type: String, default: "" },
  hostImage:          { type: String, default: "" },
  videoTrailer:       { type: String, default: "" },
  dressCode:          { type: String, default: "" },
  bagPolicy:          { type: String, default: "" },
  amenities:          [{ type: String }],
  price:              { type: Number, default: 0 },
  capacity:           { type: Number, default: 100 },
  attendees:          [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requiresModeration: { type: Boolean, default: false },
  specialCode:        { type: String, default: "" },
  faq:                [{ question: String, answer: String }],
  matchmakingEnabled: { type: Boolean, default: false },
  donations:          { type: Number, default: 0 },
  posts:              { type: Number, default: 0 },
  comments:           [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, text: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
