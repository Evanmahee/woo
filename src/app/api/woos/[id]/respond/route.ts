import { NextRequest, NextResponse } from "next/server";
import { formatActivityLabel } from "@/lib/activities";
import { notifySenderOfResponse } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Woo } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, chosen_activity, alt_date, alt_time } = body;

    if (!["accept", "choose_activity", "propose_alt"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

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
    const updates: Record<string, unknown> = {};
    let summary = "";

    if (action === "accept") {
      updates.status = "accepted";
      updates.chosen_activity = woo.plan || woo.chosen_activity;
      summary = `${woo.recipient_name} accepted your Woo! They're in for ${formatActivityLabel(
        (updates.chosen_activity as string) || woo.plan
      )} on ${woo.date} at ${String(woo.time).slice(0, 5)}. 🎉`;
    } else if (action === "choose_activity") {
      if (!chosen_activity) {
        return NextResponse.json(
          { error: "chosen_activity required" },
          { status: 400 }
        );
      }
      const allowed = Array.isArray(woo.proposed_activities)
        ? woo.proposed_activities
        : [];
      if (!allowed.includes(chosen_activity) && woo.plan !== chosen_activity) {
        return NextResponse.json(
          { error: "Activity not in shortlist" },
          { status: 400 }
        );
      }
      updates.status = "accepted";
      updates.chosen_activity = chosen_activity;
      summary = `${woo.recipient_name} picked: ${formatActivityLabel(chosen_activity)} 💕`;
    } else if (action === "propose_alt") {
      if (!alt_date || !alt_time) {
        return NextResponse.json(
          { error: "alt_date and alt_time required" },
          { status: 400 }
        );
      }
      updates.status = "proposed_alt";
      updates.proposed_alt_date = alt_date;
      updates.proposed_alt_time = alt_time;
      summary = `${woo.recipient_name} suggested another time: ${alt_date} at ${alt_time}.`;
    }

    const { data: updated, error: updateError } = await supabase
      .from("woos")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      await notifySenderOfResponse(updated as Woo, summary);
    } catch (emailErr) {
      console.warn("Notification email failed:", emailErr);
    }

    return NextResponse.json({ woo: updated, summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
