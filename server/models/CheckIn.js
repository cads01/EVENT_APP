import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scannedAt: { type: Date, default: Date.now },
});

export default mongoose.model("CheckIn", checkInSchema);
