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
  price:              { type: Number, default: 0 },
  capacity:           { type: Number, default: 100 },
  attendees:          [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requiresModeration: { type: Boolean, default: false },
  specialCode:        { type: String, default: "" },
  faq:                [{ question: String, answer: String }],
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
