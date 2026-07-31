import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling, setUserPlan } from "@/lib/billing";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

/**
 * Cancel subscription at period end (keeps access until then).
 * Prefer Customer Portal for self-serve; this is a direct API fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const immediate = body.immediate === true;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const billing = await getOrCreateBilling(email);
    if (!billing.stripe_subscription_id) {
      return NextResponse.json(
        {
          error: "Aucun abonnement actif trouvé pour cet email.",
          code: "NO_SUBSCRIPTION",
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    if (immediate) {
      await stripe.subscriptions.cancel(billing.stripe_subscription_id);
      await setUserPlan({
        email,
        stripeCustomerId: billing.stripe_customer_id,
        plan: "free",
        stripeSubscriptionId: null,
      });
      return NextResponse.json({
        ok: true,
        status: "canceled",
        message: "Abonnement annulé. Tu es repassé sur Free.",
      });
    }

    const sub = await stripe.subscriptions.update(
      billing.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    const end =
      "current_period_end" in sub && typeof sub.current_period_end === "number"
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;

    return NextResponse.json({
      ok: true,
      status: "cancel_at_period_end",
      cancel_at: end,
      message:
        "Désabonnement programmé. Tu gardes l’accès jusqu’à la fin de la période payée.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unsubscribe failed" },
      { status: 500 }
    );
  }
}
