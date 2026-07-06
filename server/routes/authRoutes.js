import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { register, login } from "../controllers/authController.js";
import { sendPasswordResetEmail } from "../config/email.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

var googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async function(req, res) {
  try {
    var { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential required" });
    var ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    var payload = ticket.getPayload();
    var email = payload.email;
    if (!email) return res.status(400).json({ message: "Google account has no email" });
    var name = payload.name || email.split("@")[0];
    var avatar = payload.picture || "";
    var user = await User.findOne({ email: email });
    if (!user) {
      var randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      var hashed = await bcrypt.hash(randomPassword, 10);
      user = await User.create({ name: name, email: email, password: hashed, avatar: avatar });
    }
    var token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/profile", verifyToken, async function(req, res) {
  try {
    var user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/profile", verifyToken, async function(req, res) {
  try {
    var { name, email } = req.body;
    var updates = {};
    if (name) updates.name = name;
    if (email) {
      var existing = await User.findOne({ email: email, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
      updates.email = email;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    var user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/password", verifyToken, async function(req, res) {
  try {
    var { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    var user = await User.findById(req.user.id);
    var valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/preferences", verifyToken, async function(req, res) {
  try {
    var { categories, soloMode } = req.body;
    var updates = {};
    if (Array.isArray(categories)) updates["preferences.categories"] = categories;
    if (typeof soloMode === "boolean") updates["preferences.soloMode"] = soloMode;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    var user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/forgot-password", async function(req, res) {
  try {
    var { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    var user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent" });
    var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await user.save();
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink: process.env.CLIENT_URL + "/reset-password?token=" + token,
      });
    } catch (emailErr) { console.error("[Forgot] Email failed:", emailErr.message); }
    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/reset-password", async function(req, res) {
  try {
    var { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    var decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch (e) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    var user = await User.findById(decoded.id);
    if (!user || user.resetToken !== token || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;