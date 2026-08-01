import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling } from "@/lib/billing";
import { stripePriceIdForTier, type PaidTier } from "@/lib/plans";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/security";
import { appUrl, getSupabaseAdmin } from "@/lib/supabase";
import { checkoutSchema, zodErrorMessage } from "@/lib/validation";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`checkout:${ip}`, 8, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => ({}));
    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { email, tier } = parsed.data;
    if (email) {
      const emailRl = rateLimit(`checkout:email:${email}`, 10, 60 * 60_000);
      if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);
    }

    const priceId = stripePriceIdForTier(tier as PaidTier);
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
      try {
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
      } catch (billingErr) {
        console.error(
          "Billing lookup failed, continuing without customer id",
          billingErr
        );
      }
    }

    // Card data never touches this server — Stripe Hosted Checkout only.
    const termsUrl = appUrl("/terms");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl(
        `/success?upgraded=1&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`
      ),
      cancel_url: appUrl("/pricing?canceled=1"),
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      metadata: { product: tier, email: email || "" },
      subscription_data: {
        metadata: { product: tier, email: email || "" },
      },
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${termsUrl}) and understand I'm waiving my 14-day right of withdrawal by getting immediate access to Woo.`,
        },
      },
    });

    return NextResponse.json({ url: session.url, tier });
  } catch (e) {
    return publicError(500, "Checkout failed", e);
  }
}
