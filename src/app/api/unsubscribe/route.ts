import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateBilling, setUserPlan } from "@/lib/billing";
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
import { unsubscribeSchema, zodErrorMessage } from "@/lib/validation";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

/**
 * Cancel subscription — requires email confirmation token.
 * Prefer Customer Portal; this is a confirmed API fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`unsubscribe:${ip}`, 6, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => ({}));
    const parsed = unsubscribeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { email, token, immediate } = parsed.data;

    if (!token) {
      const emailRl = rateLimit(`unsubscribe:request:${email}`, 3, 60 * 60_000);
      if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);

      const confirm = signPayload(
        "unsubscribe",
        { email, immediate: immediate ? "1" : "0" },
        30 * 60
      );
      const link = appUrl(
        `/pricing?unsub_token=${encodeURIComponent(confirm)}`
      );
      await sendSecurityActionEmail({
        to: email,
        subject: "Confirm Woo unsubscription",
        heading: "Confirm unsubscription",
        body: "Click below to schedule cancellation of your Woo subscription. This link expires in 30 minutes.",
        ctaUrl: link,
        ctaLabel: "Confirm unsubscription",
      });
      return NextResponse.json({
        ok: true,
        requires_confirmation: true,
        message:
          "Check your email — we sent a confirmation link to unsubscribe.",
      });
    }

    const claims = verifySignedPayload("unsubscribe", token);
    if (!claims || claims.email !== email) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link" },
        { status: 401 }
      );
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
    const doImmediate = immediate || claims.immediate === "1";

    if (doImmediate) {
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
    return publicError(500, "Unsubscribe failed", e);
  }
}
