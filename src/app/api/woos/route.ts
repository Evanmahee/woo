import { NextRequest, NextResponse } from "next/server";
import { ACTIVITIES } from "@/lib/activities";
import { canSendWoo, incrementWooCount } from "@/lib/billing";
import { PLAN_LIMITS, themeAllowedForPlan } from "@/lib/plans";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
  signPayload,
} from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getThemeIndex, THEMES } from "@/lib/themes";
import { createWooSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`woos:create:${ip}`, 10, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => null);
    const parsed = createWooSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const emailRl = rateLimit(
      `woos:create:email:${body.sender_email}`,
      8,
      60 * 60_000
    );
    if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);

    const themeMeta = THEMES.find((t) => t.key === body.theme) ?? THEMES[0];
    const themeIndex = getThemeIndex(themeMeta.key);
    const { allowed, plan: userPlan } = await canSendWoo(
      body.sender_email
    );
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

    if (body.activity_mode === "recipient_choice" && !limits.recipientChoice) {
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
      body.plan === "surprise" ||
      (Array.isArray(body.proposed_activities) &&
        body.proposed_activities.includes("surprise"));
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

    // Validate activity keys still exist (defense in depth)
    if (
      body.activity_mode === "fixed" &&
      !ACTIVITIES.some((a) => a.key === body.plan)
    ) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: woo, error } = await supabase
      .from("woos")
      .insert({
        sender_name: body.sender_name,
        sender_email: body.sender_email,
        recipient_name: body.recipient_name,
        recipient_email: body.recipient_email,
        date: body.date,
        time: body.time,
        activity_mode: body.activity_mode,
        plan: body.activity_mode === "fixed" ? body.plan : null,
        proposed_activities:
          body.activity_mode === "recipient_choice"
            ? body.proposed_activities
            : null,
        custom_message: body.custom_message || null,
        theme: themeMeta.key,
        status: "pending",
      })
      .select(
        "id, sender_name, date, time, activity_mode, plan, proposed_activities, custom_message, theme, status, created_at"
      )
      .single();

    if (error || !woo) {
      return publicError(500, "Could not create Woo", error);
    }

    await incrementWooCount(body.sender_email);

    const send_token = signPayload(
      "woo_send",
      { woo_id: woo.id, email: body.sender_email },
      60 * 60
    );

    return NextResponse.json({
      woo,
      send_token,
      plan: userPlan,
      is_pro: userPlan === "woo_pro",
    });
  } catch (e) {
    return publicError(500, "Server error", e);
  }
}
