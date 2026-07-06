import { baseLayout } from "./base.js";

export function broadcastHtml({ eventTitle, subject, message }) {
  var body = "\n" +
    "      <h2>" + (subject || "Update: " + eventTitle) + "</h2>\n" +
    "      <div style=\"margin-bottom: 8px;\">\n" +
    "        <span style=\"display: inline-block; background: #27272a; color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px;\">" + eventTitle + "</span>\n" +
    "      </div>\n" +
    "      <p>" + message.replace(/\n/g, "<br>") + "</p>\n" +
    "      <a href=\"/events/\" class=\"btn\">View Event</a>\n";
  return baseLayout(body);
}
