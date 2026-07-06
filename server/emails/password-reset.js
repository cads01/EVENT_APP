import { baseLayout } from "./base.js";

export function passwordResetHtml({ name, resetLink }) {
  var body = "\n" +
    "      <h2>Reset Your Password</h2>\n" +
    "      <p>Hi " + name + ",</p>\n" +
    "      <p>We received a request to reset your EventApp password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>\n" +
    "      <div style=\"text-align: center;\">\n" +
    "        <a href=\"" + resetLink + "\" class=\"btn\">Reset Password</a>\n" +
    "      </div>\n" +
    "      <p style=\"font-size: 13px; color: #71717a;\">If you didn't request this, you can safely ignore this email.</p>\n" +
    "      <p style=\"font-size: 13px; color: #71717a;\">If the button doesn't work, copy and paste this link into your browser:</p>\n" +
    "      <p style=\"font-size: 12px; word-break: break-all; color: #f59e0b;\">" + resetLink + "</p>\n";
  return baseLayout(body);
}
