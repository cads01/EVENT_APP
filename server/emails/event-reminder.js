import { baseLayout } from "./base.js";

export function eventReminderHtml({ name, eventTitle, eventDate, eventLocation }) {
  var body = "\n" +
    "      <h2>Reminder: " + eventTitle + " is coming up! 🎪</h2>\n" +
    "      <p>Hi " + name + ",</p>\n" +
    "      <p>This is a friendly reminder that <strong style=\"color:#fff;\">" + eventTitle + "</strong> is happening soon.</p>\n" +
    "      <div class=\"highlight\">\n" +
    "        <p><strong>Event:</strong> " + eventTitle + "</p>\n" +
    "        <p><strong>Date:</strong> " + new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric" }) + "</p>\n" +
    "        <p><strong>Location:</strong> " + eventLocation + "</p>\n" +
    "      </div>\n" +
    "      <div style=\"text-align: center;\">\n" +
    "        <a href=\"/events/\" class=\"btn\">View Details</a>\n" +
    "      </div>\n" +
    "      <p style=\"font-size: 13px; color: #71717a;\">Don't forget to bring your ticket! Check in at the venue entrance.</p>\n";
  return baseLayout(body);
}
