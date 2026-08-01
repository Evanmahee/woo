import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PLAN_LIMITS, normalizePlan } from "@/lib/plans";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/security";
import { z } from "zod";

const querySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

/**
 * Lookup-only billing status. Does NOT create rows (prevents email spam pollution).
 * Still email-spoofable for read of plan/quota — full auth recommended (see audit).
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`billing:get:${ip}`, 30, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

  const emailRaw = req.nextUrl.searchParams.get("email");
  const parsed = querySchema.safeParse({ email: emailRaw });
  if (!parsed.success) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users_billing")
      .select("plan, woos_sent_this_month, month_key")
      .eq("email", parsed.data.email)
      .maybeSingle();

    if (error) return publicError(500, "Error", error);
    if (!data) {
      return NextResponse.json({
        plan: "free",
        is_pro: false,
        woos_sent_this_month: 0,
        remaining: PLAN_LIMITS.free.woosPerMonth,
      });
    }

    const plan = normalizePlan(data.plan);
    const limit = PLAN_LIMITS[plan].woosPerMonth;
    return NextResponse.json({
      plan,
      is_pro: plan === "woo_pro",
      woos_sent_this_month: data.woos_sent_this_month,
      remaining:
        limit === Infinity
          ? null
          : Math.max(0, limit - (data.woos_sent_this_month || 0)),
    });
  } catch (e) {
    return publicError(500, "Error", e);
  }
}
