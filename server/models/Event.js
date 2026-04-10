// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  createdBy: String,
});

export default mongoose.model("Event", eventSchema);