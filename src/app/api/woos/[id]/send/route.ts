import { NextRequest, NextResponse } from "next/server";
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

    if (
      String((woo as Woo).sender_email).toLowerCase() !==
      String(claims.email).toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await sendWooInvitation(woo as Woo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return publicError(500, "Failed to send email", e);
  }
}
