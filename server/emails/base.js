export function baseLayout(bodyContent) {
  return "\n" +
    "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\" />\n" +
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n" +
    "  <style>\n" +
    "    * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
    "    body { background: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }\n" +
    "    .wrapper { max-width: 600px; margin: 0 auto; padding: 0; }\n" +
    "    .header { background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0; }\n" +
    "    .header h1 { color: #fff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }\n" +
    "    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 6px; }\n" +
    "    .body { background: #18181b; padding: 40px 30px; }\n" +
    "    .body h2 { color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 12px; }\n" +
    "    .body p { color: #a1a1aa; font-size: 15px; line-height: 1.7; margin-bottom: 16px; }\n" +
    "    .body .highlight { background: #27272a; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; margin: 20px 0; }\n" +
    "    .body .highlight p { color: #d4d4d8; font-size: 14px; margin-bottom: 6px; }\n" +
    "    .body .highlight strong { color: #fff; }\n" +
    "    .btn { display: inline-block; background: #f59e0b; color: #09090b !important; font-weight: 900; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 16px 0; }\n" +
    "    .footer { background: #18181b; border-top: 1px solid #27272a; padding: 24px 30px; text-align: center; border-radius: 0 0 16px 16px; }\n" +
    "    .footer p { color: #52525b; font-size: 12px; }\n" +
    "    .footer a { color: #f59e0b; text-decoration: none; }\n" +
    "  </style>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <div class=\"wrapper\">\n" +
    "    <div class=\"header\">\n" +
    "      <h1>EventApp</h1>\n" +
    "      <p>Your events, one place</p>\n" +
    "    </div>\n" +
    "    <div class=\"body\">\n" +
    bodyContent + "\n" +
    "    </div>\n" +
    "    <div class=\"footer\">\n" +
    "      <p>Sent by EventApp &bull; <a href=\"#\">Unsubscribe</a></p>\n" +
    "      <p style=\"margin-top: 4px;\">© 2026 EventApp. All rights reserved.</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</body>\n" +
    "</html>\n";
}
