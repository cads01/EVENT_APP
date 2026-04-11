import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendRSVPConfirmation = async ({ to, name, eventTitle, eventDate, eventLocation }) => {
  await resend.emails.send({
    from: "EventApp <onboarding@resend.dev>",
     to: to, // dynamic - sends to whoever RSVPs
    subject: `RSVP Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're going to ${eventTitle}! 🎉</h2>
        <p>Hi ${name},</p>
        <p>Your RSVP has been confirmed. Here are your event details:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toDateString()}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>See you there!</p>
        <p style="color: #6b7280; font-size: 14px;">— The EventApp Team</p>
      </div>
    `,
  });
};