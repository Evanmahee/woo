import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling } from "@/lib/billing";
import { appUrl } from "@/lib/supabase";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const intent = body.intent === "cancel" ? "cancel" : "manage";

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const billing = await getOrCreateBilling(email);
    if (!billing.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "Aucun abonnement Stripe trouvé pour cet email. Utilise l’email du paiement.",
          code: "NO_CUSTOMER",
        },
        { status: 400 }
      );
    }

    if (billing.plan === "free" && intent === "cancel") {
      return NextResponse.json(
        { error: "Tu es déjà sur le plan Free." },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Prefer deep-link into cancel flow when we have a subscription id
    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: billing.stripe_customer_id,
      return_url: appUrl(
        intent === "cancel" ? "/pricing?canceled=1" : "/pricing"
      ),
    };

    if (intent === "cancel" && billing.stripe_subscription_id) {
      sessionParams.flow_data = {
        type: "subscription_cancel",
        subscription_cancel: {
          subscription: billing.stripe_subscription_id,
        },
      };
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Portal failed" },
      { status: 500 }
    );
  }
}
