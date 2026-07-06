// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "organizer", "admin"], default: "user" },
  preferences: {
    categories: [{ type: String }],
    soloMode: { type: Boolean, default: false },
  },
  badges: [{ type: String }],
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
