import { NextRequest, NextResponse } from "next/server";
import { decrementWooCount } from "@/lib/billing";
import { sendWooInvitation } from "@/lib/email";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
  verifySignedPayload,
} from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Woo } from "@/lib/types";
import { sendWooSchema, zodErrorMessage } from "@/lib/validation";

function isResendConfigError(err: unknown): boolean {
  const msg = String(
    err instanceof Error ? err.message : (err as { message?: string })?.message || err
  ).toLowerCase();
  return (
    msg.includes("resend.dev") ||
    msg.includes("only send testing") ||
    msg.includes("own email") ||
    msg.includes("not verified") ||
    msg.includes("invalid from") ||
    msg.includes("domain is not verified")
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`woos:send:${ip}:${params.id}`, 5, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => ({}));
    const parsed = sendWooSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const claims = verifySignedPayload("woo_send", parsed.data.send_token);
    if (!claims || claims.woo_id !== params.id) {
      return NextResponse.json(
        { error: "Invalid or expired send token" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: woo, error } = await supabase
      .from("woos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !woo) {
      return NextResponse.json({ error: "Woo not found" }, { status: 404 });
    }

    const row = woo as Woo;
    if (
      String(row.sender_email).toLowerCase() !==
      String(claims.email).toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const result = await sendWooInvitation(row);
      return NextResponse.json({
        success: true,
        ok: true,
        emailId: result.id,
      });
    } catch (sendErr) {
      console.error("Resend send failed:", sendErr);
      // Free the monthly quota reserved at create-time
      try {
        await decrementWooCount(row.sender_email);
      } catch (quotaErr) {
        console.error("Failed to release Woo quota after send error:", quotaErr);
      }

      const configIssue =
        isResendConfigError(sendErr) ||
        String(process.env.RESEND_FROM_EMAIL || "").includes("resend.dev");

      return NextResponse.json(
        {
          success: false,
          code: configIssue ? "RESEND_CONFIG" : "RESEND_FAILED",
          error: "Failed to send invitation email",
        },
        { status: 502 }
      );
    }
  } catch (e) {
    return publicError(500, "Failed to send email", e);
  }
}
