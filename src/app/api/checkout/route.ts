import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling } from "@/lib/billing";
import { stripePriceIdForTier, type PaidTier } from "@/lib/plans";
import { appUrl, getSupabaseAdmin } from "@/lib/supabase";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const tier = (body.tier === "woo_plus" ? "woo_plus" : "woo_pro") as PaidTier;
    const priceId = stripePriceIdForTier(tier);

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            tier === "woo_plus"
              ? "STRIPE_PRICE_ID_WOO_PLUS not configured"
              : "STRIPE_PRICE_ID_WOO_PRO not configured",
        },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let customerId: string | undefined;

    if (email) {
      const billing = await getOrCreateBilling(email);
      if (billing.stripe_customer_id) {
        customerId = billing.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({ email });
        customerId = customer.id;
        await getSupabaseAdmin()
          .from("users_billing")
          .update({ stripe_customer_id: customerId })
          .eq("id", billing.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl(`/success?upgraded=1&tier=${tier}`),
      cancel_url: appUrl("/pricing"),
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      metadata: { product: tier, email: email || "" },
      subscription_data: {
        metadata: { product: tier, email: email || "" },
      },
    });

    return NextResponse.json({ url: session.url, tier });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
