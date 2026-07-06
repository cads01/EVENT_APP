import { Resend } from "resend";
import { rsvpConfirmationHtml } from "../emails/rsvp-confirmation.js";
import { passwordResetHtml } from "../emails/password-reset.js";
import { broadcastHtml } from "../emails/broadcast.js";

export const getResend = () =>
  new Resend(process.env.RESEND_API_KEY);

export const sendRSVPConfirmation = async ({ to, name, eventTitle, eventDate, eventLocation, ticketCode }) => {
  const resend = getResend();
  await resend.emails.send({
    from: "EventApp <onboarding@resend.dev>",
    to: to,
    subject: "RSVP Confirmed: " + eventTitle,
    html: rsvpConfirmationHtml({ name, eventTitle, eventDate, eventLocation, ticketCode }),
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  const resend = getResend();
  await resend.emails.send({
    from: "EventApp <onboarding@resend.dev>",
    to: to,
    subject: "Reset Your EventApp Password",
    html: passwordResetHtml({ name, resetLink }),
  });
};

export const sendBroadcastEmail = async ({ eventTitle, subject, message, recipients }) => {
  const resend = getResend();
  if (recipients.length === 0) return;
  const emails = recipients.map(r => ({ to: r.email, name: r.name }));
  const bccList = emails.map(e => e.to);
  await resend.emails.send({
    from: "EventApp <onboarding@resend.dev>",
    to: emails[0].to,
    bcc: bccList.slice(1),
    subject: subject || "Update from " + eventTitle,
    html: broadcastHtml({ eventTitle, subject, message }),
  });
};
