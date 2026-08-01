import { NextRequest, NextResponse } from "next/server";
import { formatActivityLabel } from "@/lib/activities";
import { notifySenderOfResponse } from "@/lib/email";
import {
  clientIp,
  publicError,
  publicWooView,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Woo } from "@/lib/types";
import { respondWooSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`woos:respond:${ip}:${params.id}`, 20, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        params.id
      )
    ) {
      return NextResponse.json({ error: "Woo not found" }, { status: 404 });
    }

    const raw = await req.json().catch(() => null);
    const parsed = respondWooSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const supabase = getSupabaseAdmin();
    const { data: existing, error: fetchError } = await supabase
      .from("woos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Woo not found" }, { status: 404 });
    }

    const woo = existing as Woo;
    if (woo.status !== "pending") {
      return NextResponse.json(
        { error: "This Woo was already answered" },
        { status: 409 }
      );
    }

    const updates: Record<string, unknown> = {};
    let summary = "";

    if (body.action === "accept") {
      updates.status = "accepted";
      updates.chosen_activity = woo.plan || woo.chosen_activity;
      summary = `${woo.recipient_name} accepted your Woo! They're in for ${formatActivityLabel(
        (updates.chosen_activity as string) || woo.plan
      )} on ${woo.date} at ${String(woo.time).slice(0, 5)}. 🎉`;
    } else if (body.action === "choose_activity") {
      const allowed = Array.isArray(woo.proposed_activities)
        ? woo.proposed_activities
        : [];
      if (!allowed.includes(body.chosen_activity) && woo.plan !== body.chosen_activity) {
        return NextResponse.json(
          { error: "Activity not in shortlist" },
          { status: 400 }
        );
      }
      updates.status = "accepted";
      updates.chosen_activity = body.chosen_activity;
      summary = `${woo.recipient_name} picked: ${formatActivityLabel(body.chosen_activity)} 💕`;
    } else {
      updates.status = "proposed_alt";
      updates.proposed_alt_date = body.alt_date;
      updates.proposed_alt_time = body.alt_time;
      summary = `${woo.recipient_name} suggested another time: ${body.alt_date} at ${body.alt_time}.`;
    }

    const { data: updated, error: updateError } = await supabase
      .from("woos")
      .update(updates)
      .eq("id", params.id)
      .eq("status", "pending")
      .select("*")
      .single();

    if (updateError || !updated) {
      return publicError(409, "Could not update Woo", updateError);
    }

    try {
      await notifySenderOfResponse(updated as Woo, summary);
    } catch (emailErr) {
      console.warn("Notification email failed:", emailErr);
    }

    return NextResponse.json({
      woo: publicWooView(updated as Record<string, unknown>),
      summary,
    });
  } catch (e) {
    return publicError(500, "Server error", e);
  }
}
