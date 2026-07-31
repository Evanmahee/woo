import { NextRequest, NextResponse } from "next/server";
import { ACTIVITIES } from "@/lib/activities";
import { canSendWoo, incrementWooCount } from "@/lib/billing";
import { PLAN_LIMITS, themeAllowedForPlan } from "@/lib/plans";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getThemeIndex, THEMES } from "@/lib/themes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sender_name,
      sender_email,
      recipient_name,
      recipient_email,
      date,
      time,
      activity_mode = "fixed",
      plan,
      proposed_activities,
      custom_message,
      theme = "default",
    } = body;

    if (
      !sender_name ||
      !sender_email ||
      !recipient_name ||
      !recipient_email ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["fixed", "recipient_choice"].includes(activity_mode)) {
      return NextResponse.json({ error: "Invalid activity_mode" }, { status: 400 });
    }

    if (activity_mode === "fixed") {
      if (!plan || !ACTIVITIES.some((a) => a.key === plan)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
    } else {
      if (
        !Array.isArray(proposed_activities) ||
        proposed_activities.length < 2 ||
        proposed_activities.length > 5 ||
        !proposed_activities.every((k: string) =>
          ACTIVITIES.some((a) => a.key === k)
        )
      ) {
        return NextResponse.json(
          { error: "proposed_activities must be 2–5 valid activity keys" },
          { status: 400 }
        );
      }
    }

    const themeMeta = THEMES.find((t) => t.key === theme) ?? THEMES[0];
    const themeIndex = getThemeIndex(themeMeta.key);
    const { allowed, plan: userPlan, billing } = await canSendWoo(sender_email);
    const limits = PLAN_LIMITS[userPlan];

    if (!allowed) {
      const upgradeHint =
        userPlan === "free"
          ? "Upgrade to Woo+ (5/mo) or Woo Pro (unlimited)."
          : "Upgrade to Woo Pro for unlimited Woos.";
      return NextResponse.json(
        {
          error: `Monthly Woo limit reached (${limits.woosPerMonth}/mo on ${limits.label}). ${upgradeHint}`,
          code: "QUOTA_EXCEEDED",
          required_tier: userPlan === "free" ? "woo_plus" : "woo_pro",
        },
        { status: 402 }
      );
    }

    if (activity_mode === "recipient_choice" && !limits.recipientChoice) {
      return NextResponse.json(
        {
          error: '"Let them pick" requires Woo+ or Woo Pro',
          code: "PLUS_REQUIRED",
          required_tier: "woo_plus",
        },
        { status: 402 }
      );
    }

    if (!themeAllowedForPlan(themeIndex, userPlan)) {
      const required =
        themeIndex < PLAN_LIMITS.woo_plus.themes ? "woo_plus" : "woo_pro";
      return NextResponse.json(
        {
          error: `This theme requires ${PLAN_LIMITS[required].label}`,
          code: required === "woo_plus" ? "PLUS_REQUIRED" : "PRO_REQUIRED",
          required_tier: required,
        },
        { status: 402 }
      );
    }

    const usesSurprise =
      plan === "surprise" ||
      (Array.isArray(proposed_activities) &&
        proposed_activities.includes("surprise"));
    if (usesSurprise && !limits.surpriseDate) {
      return NextResponse.json(
        {
          error: "Surprise Date requires Woo Pro",
          code: "PRO_REQUIRED",
          required_tier: "woo_pro",
        },
        { status: 402 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: woo, error } = await supabase
      .from("woos")
      .insert({
        sender_name: String(sender_name).trim(),
        sender_email: String(sender_email).trim().toLowerCase(),
        recipient_name: String(recipient_name).trim(),
        recipient_email: String(recipient_email).trim().toLowerCase(),
        date,
        time,
        activity_mode,
        plan: activity_mode === "fixed" ? plan : null,
        proposed_activities:
          activity_mode === "recipient_choice" ? proposed_activities : null,
        custom_message: custom_message ? String(custom_message).trim() : null,
        theme: themeMeta.key,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await incrementWooCount(sender_email);

    return NextResponse.json({
      woo,
      plan: userPlan,
      is_pro: userPlan === "woo_pro",
      billing_id: billing.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
