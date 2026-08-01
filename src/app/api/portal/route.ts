import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling } from "@/lib/billing";
import { sendSecurityActionEmail } from "@/lib/email";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
  signPayload,
  verifySignedPayload,
} from "@/lib/security";
import { appUrl } from "@/lib/supabase";
import { portalSchema, zodErrorMessage } from "@/lib/validation";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

/**
 * Sensitive: opens Stripe Customer Portal for an email.
 * Requires a signed email confirmation token (proof of inbox ownership).
 * Without token → sends confirmation email.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`portal:${ip}`, 8, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => ({}));
    const parsed = portalSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { email, intent, token } = parsed.data;

    if (!token) {
      const emailRl = rateLimit(`portal:request:${email}`, 3, 60 * 60_000);
      if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);

      const confirm = signPayload(
        "portal",
        { email, intent },
        30 * 60
      );
      const link = appUrl(
        `/pricing?portal_token=${encodeURIComponent(confirm)}&intent=${intent}`
      );
      await sendSecurityActionEmail({
        to: email,
        subject: "Confirm access to your Woo billing",
        heading: "Confirm billing access",
        body: "Click below to open your Stripe billing portal. This link expires in 30 minutes.",
        ctaUrl: link,
        ctaLabel: "Open billing portal",
      });
      return NextResponse.json({
        ok: true,
        requires_confirmation: true,
        message:
          "Check your email — we sent a confirmation link to open your billing portal.",
      });
    }

    const claims = verifySignedPayload("portal", token);
    if (!claims || claims.email !== email) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 401 }
      );
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

    const resolvedIntent =
      claims.intent === "cancel" || intent === "cancel" ? "cancel" : "manage";

    if (billing.plan === "free" && resolvedIntent === "cancel") {
      return NextResponse.json(
        { error: "Tu es déjà sur le plan Free." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: billing.stripe_customer_id,
      return_url: appUrl(
        resolvedIntent === "cancel" ? "/pricing?canceled=1" : "/pricing"
      ),
    };

    if (resolvedIntent === "cancel" && billing.stripe_subscription_id) {
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
    return publicError(500, "Portal failed", e);
  }
}
