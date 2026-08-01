import { NextRequest, NextResponse } from "next/server";
import { sendSecurityActionEmail } from "@/lib/email";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
  signPayload,
  verifySignedPayload,
} from "@/lib/security";
import { appUrl, getSupabaseAdmin } from "@/lib/supabase";
import { privacyDeleteSchema, zodErrorMessage } from "@/lib/validation";

/**
 * GDPR erasure request.
 * Without token → emails confirmation link.
 * With valid token → deletes matching Woo rows + billing row for that email.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`privacy:delete:${ip}`, 5, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => ({}));
    const parsed = privacyDeleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { email, token, role } = parsed.data;

    if (!token) {
      const emailRl = rateLimit(`privacy:request:${email}`, 3, 60 * 60_000);
      if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);

      const confirm = signPayload("privacy_delete", { email, role }, 60 * 60);
      const link = appUrl(
        `/privacy?delete_token=${encodeURIComponent(confirm)}&email=${encodeURIComponent(email)}`
      );
      await sendSecurityActionEmail({
        to: email,
        subject: "Confirm Woo data deletion",
        heading: "Confirm data deletion",
        body: "Click below to permanently delete Woo data associated with this email. This cannot be undone.",
        ctaUrl: link,
        ctaLabel: "Delete my data",
      });
      return NextResponse.json({
        ok: true,
        requires_confirmation: true,
        message:
          "Check your email — we sent a confirmation link to delete your data.",
      });
    }

    const claims = verifySignedPayload("privacy_delete", token);
    if (!claims || claims.email !== email) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const resolvedRole = (claims.role as typeof role) || role;

    if (resolvedRole === "sender" || resolvedRole === "both") {
      await supabase.from("woos").delete().eq("sender_email", email);
      await supabase.from("users_billing").delete().eq("email", email);
    }
    if (resolvedRole === "recipient" || resolvedRole === "both") {
      await supabase.from("woos").delete().eq("recipient_email", email);
    }

    return NextResponse.json({
      ok: true,
      message: "Your data associated with this email has been deleted.",
    });
  } catch (e) {
    return publicError(500, "Deletion failed", e);
  }
}
