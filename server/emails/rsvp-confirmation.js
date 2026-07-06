import { baseLayout } from "./base.js";

export function rsvpConfirmationHtml({ name, eventTitle, eventDate, eventLocation, ticketCode }) {
  var body = "\n" +
    "      <h2>You're in, " + name + "! 🎉</h2>\n" +
    "      <p>Your RSVP for <strong style=\"color:#fff;\">" + eventTitle + "</strong> is confirmed.</p>\n" +
    "      <div class=\"highlight\">\n" +
    "        <p><strong>Event:</strong> " + eventTitle + "</p>\n" +
    "        <p><strong>Date:</strong> " + new Date(eventDate).toDateString() + "</p>\n" +
    "        <p><strong>Location:</strong> " + eventLocation + "</p>\n" +
    "        <p style=\"margin-top: 12px; padding-top: 12px; border-top: 1px solid #3f3f46;\"><strong>Ticket Code:</strong> <span style=\"font-family: monospace; color: #f59e0b;\">" + ticketCode + "</span></p>\n" +
    "      </div>\n" +
    "      <a href=\"/my-tickets\" class=\"btn\">View My Tickets</a>\n" +
    "      <p style=\"font-size: 13px; color: #71717a;\">Show your ticket code at the door for check-in.</p>\n";
  return baseLayout(body);
}
