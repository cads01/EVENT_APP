import mongoose from "mongoose";

const splitPaymentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalAmount: { type: Number, required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    share: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paidAt: { type: Date },
    transactionRef: { type: String },
  }],
  status: { type: String, enum: ["pending", "partially_paid", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SplitPayment", splitPaymentSchema);
