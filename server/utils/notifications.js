import Notification from "../models/Notification.js";
import { broadcast } from "../config/supabase.js";

export async function createNotification(userId, { type, title, message, eventId, link }) {
  try {
    var n = await Notification.create({
      user: userId,
      event: eventId || undefined,
      type: type || "update",
      title,
      message,
      link: link || "",
    });
    broadcast("notifications:" + userId, "new-notification", n.toObject());
    return n;
  } catch (err) {
    console.error("[notifications] Failed:", err.message);
    return null;
  }
}
