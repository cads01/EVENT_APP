// jobs/reminderJob.js
import cron from "node-cron";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Build Google Maps directions URL
// If we have venue coords use them, otherwise fall back to address string
const buildMapUrl = (venue, location) => {
  if (venue?.lat && venue?.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;
  }
  const query = encodeURIComponent(venue?.address || location);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
};

// Build Google Maps embed static map image URL (no API key needed for links)
const buildStaticMapUrl = (venue, location) => {
  if (venue?.lat && venue?.lng) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${venue.lat},${venue.lng}&zoom=15&size=600x300&markers=color:red%7C${venue.lat},${venue.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  }
  const query = encodeURIComponent(venue?.address || location);
  return `https://maps.googleapis.com/maps/api/staticmap?center=${query}&zoom=15&size=600x300&markers=color:red%7C${query}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
};

// Countdown string: "3 days, 4 hours"
const getCountdown = (eventDate) => {
  const now = new Date();
  const diff = eventDate - now;
  if (diff <= 0) return "happening now";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

const buildEmailHtml = (user, event) => {
  const countdown = getCountdown(event.date);
  const mapUrl = buildMapUrl(event.venue, event.location);
  const staticMapUrl = buildStaticMapUrl(event.venue, event.location);
  const eventDateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const eventTimeStr = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const hasMap = !!process.env.GOOGLE_MAPS_API_KEY;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reminder: ${event.title}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">

        <!-- Header -->
        <tr>
          <td style="background:#080808;padding:28px 40px;border-bottom:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#e8c97a;font-family:monospace;">
              EventApp · Reminder
            </p>
          </td>
        </tr>

        <!-- Countdown hero -->
        <tr>
          <td style="padding:40px 40px 24px;text-align:center;background:#080808;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#666;font-family:monospace;">
              Time until event
            </p>
            <p style="margin:0;font-size:52px;font-weight:800;color:#e8c97a;letter-spacing:-0.03em;line-height:1;">
              ${countdown}
            </p>
          </td>
        </tr>

        <!-- Event details -->
        <tr>
          <td style="padding:32px 40px;border-top:1px solid #1e1e1e;">
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#f0ede6;letter-spacing:-0.02em;">
              ${event.title}
            </h1>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">Date&nbsp;&nbsp;</span>
                  <span style="font-size:14px;color:#f0ede6;">${eventDateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">Time&nbsp;&nbsp;</span>
                  <span style="font-size:14px;color:#f0ede6;">${eventTimeStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-family:monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">Location&nbsp;&nbsp;</span>
                  <span style="font-size:14px;color:#f0ede6;">${event.venue?.address || event.location}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Map section -->
        ${hasMap ? `
        <tr>
          <td style="padding:0 40px 24px;">
            <a href="${mapUrl}" target="_blank" style="display:block;border-radius:6px;overflow:hidden;border:1px solid #2a2a2a;">
              <img src="${staticMapUrl}" alt="Event location map" width="520" style="display:block;width:100%;height:auto;" />
            </a>
          </td>
        </tr>
        ` : ""}

        <!-- Get Directions CTA -->
        <tr>
          <td style="padding:0 40px 40px;">
            <a href="${mapUrl}" target="_blank"
              style="display:inline-block;background:#e8c97a;color:#080808;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:3px;">
              Get Directions →
            </a>
            <p style="margin:16px 0 0;font-family:monospace;font-size:11px;color:#444;line-height:1.6;">
              This link opens Google Maps and uses your current location to navigate you directly to the venue.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1e1e1e;background:#080808;">
            <p style="margin:0;font-family:monospace;font-size:10px;color:#333;letter-spacing:0.08em;">
              You're receiving this because you RSVP'd to <strong style="color:#555;">${event.title}</strong>.<br/>
              Hi ${user.name} — we'll see you there.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
};

const sendReminders = async () => {
  console.log("[ReminderJob] Running weekly reminder check...");

  // Find all upcoming events (not yet passed)
  const upcomingEvents = await Event.find({
    date: { $gt: new Date() },
    attendees: { $exists: true, $not: { $size: 0 } },
  }).populate("attendees", "name email");

  if (!upcomingEvents.length) {
    console.log("[ReminderJob] No upcoming events with attendees.");
    return;
  }

  for (const event of upcomingEvents) {
    console.log(`[ReminderJob] Sending reminders for: ${event.title} (${event.attendees.length} attendees)`);

    for (const attendee of event.attendees) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "reminders@yourdomain.com",
          to: attendee.email,
          subject: `⏰ Reminder: ${event.title} is in ${getCountdown(event.date)}`,
          html: buildEmailHtml(attendee, event),
        });
        console.log(`[ReminderJob] ✓ Sent to ${attendee.email}`);
      } catch (err) {
        console.error(`[ReminderJob] ✗ Failed for ${attendee.email}:`, err.message);
      }
    }
  }

  console.log("[ReminderJob] Done.");
};

// Run every Monday at 9:00 AM server time
// Cron format: minute hour day-of-month month day-of-week
// "0 9 * * 1" = 9:00 AM every Monday
export const startReminderJob = () => {
  cron.schedule("0 9 * * 1", sendReminders, {
    timezone: "Africa/Lagos",
  });
  console.log("[ReminderJob] Weekly reminder job scheduled (Mondays 9AM Lagos time)");
};

// Named export for manual trigger (useful for testing via a route)
export { sendReminders };
