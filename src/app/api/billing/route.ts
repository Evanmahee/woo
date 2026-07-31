import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBilling } from "@/lib/billing";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  try {
    const billing = await getOrCreateBilling(email);
    const limit = PLAN_LIMITS[billing.plan].woosPerMonth;
    return NextResponse.json({
      plan: billing.plan,
      is_pro: billing.plan === "woo_pro",
      woos_sent_this_month: billing.woos_sent_this_month,
      remaining:
        limit === Infinity
          ? null
          : Math.max(0, limit - (billing.woos_sent_this_month || 0)),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
