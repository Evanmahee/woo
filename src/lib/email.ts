import { Resend } from "resend";
import { formatActivityLabel } from "./activities";
import { escapeHtml } from "./security";
import { appUrl } from "./supabase";
import type { Woo } from "./types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL || "Woo <onboarding@resend.dev>";

export type ResendSendResult = { id: string };

async function sendWithResend(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<ResendSendResult> {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("Resend send failed:", error);
    throw new Error(error.message || "Failed to send email");
  }

  const id = data?.id;
  if (!id) {
    console.error("Resend send returned no email id:", data);
    throw new Error("Failed to send email");
  }

  console.log("Resend send succeeded, email id:", id);
  return { id };
}

function emailShell(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#EAE0F8,#F7EAE2,#FCEFD9);font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;padding:40px 32px;box-shadow:0 20px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="text-align:center;">
              <p style="margin:0 0 8px;font-style:italic;font-size:28px;color:#3D1F2B;">Woo</p>
              <p style="margin:0 0 28px;font-family:system-ui,sans-serif;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7A85;">To woo.</p>
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#E85D75;color:#fff;text-decoration:none;border-radius:16px;font-family:system-ui,sans-serif;font-size:15px;font-weight:500;">${escapeHtml(label)}</a>`;
}

export function buildInvitationEmailHtml(woo: Pick<
  Woo,
  | "id"
  | "sender_name"
  | "date"
  | "time"
  | "activity_mode"
  | "plan"
  | "custom_message"
>) {
  const link = appUrl(`/w/${woo.id}`);
  const planLine =
    woo.activity_mode === "fixed"
      ? escapeHtml(formatActivityLabel(woo.plan))
      : "a shortlist of date ideas for you to choose from";

  const sender = escapeHtml(woo.sender_name);
  const date = escapeHtml(woo.date);
  const time = escapeHtml(String(woo.time).slice(0, 5));
  const message = woo.custom_message ? escapeHtml(woo.custom_message) : "";

  return {
    subject: `${woo.sender_name} wants to woo you 💌`.slice(0, 200),
    html: emailShell(`
    <h1 style="margin:0 0 12px;font-size:28px;color:#3D1F2B;font-weight:700;">You've been Woo'd</h1>
    <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#3D1F2B;">
      <strong>${sender}</strong> wants to woo you on <strong>${date}</strong> at <strong>${time}</strong>
      — ${planLine}.
    </p>
    ${
      message
        ? `<p style="margin:0 0 8px;padding:16px;background:#F7DCE3;border-radius:16px;font-family:system-ui,sans-serif;font-size:15px;font-style:italic;color:#3D1F2B;">“${message}”</p>`
        : ""
    }
    ${ctaButton(link, "Open your Woo 💌")}
  `),
  };
}

export async function sendWooInvitation(woo: Woo): Promise<ResendSendResult> {
  const { subject, html } = buildInvitationEmailHtml(woo);
  return sendWithResend({
    to: woo.recipient_email,
    subject,
    html,
  });
}

export async function notifySenderOfResponse(woo: Woo, summary: string) {
  const link = appUrl(`/w/${woo.id}`);

  const html = emailShell(`
    <h1 style="margin:0 0 12px;font-size:26px;color:#3D1F2B;font-weight:700;">Your Woo got a reply</h1>
    <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#3D1F2B;">
      ${escapeHtml(summary)}
    </p>
    ${ctaButton(link, "View Woo")}
  `);

  return sendWithResend({
    to: woo.sender_email,
    subject: `${woo.recipient_name} responded to your Woo 🎉`.slice(0, 200),
    html,
  });
}

export async function sendSecurityActionEmail(opts: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
}) {
  const html = emailShell(`
    <h1 style="margin:0 0 12px;font-size:26px;color:#3D1F2B;font-weight:700;">${escapeHtml(opts.heading)}</h1>
    <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#3D1F2B;">
      ${escapeHtml(opts.body)}
    </p>
    ${ctaButton(opts.ctaUrl, opts.ctaLabel)}
    <p style="margin:24px 0 0;font-family:system-ui,sans-serif;font-size:12px;color:#8A7A85;">
      If you didn&apos;t request this, you can ignore this email.
    </p>
  `);

  return sendWithResend({
    to: opts.to,
    subject: opts.subject.slice(0, 200),
    html,
  });
}
