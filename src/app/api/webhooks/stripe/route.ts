import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { setUserPlan } from "@/lib/billing";
import { tierFromStripePriceId, type PlanTier } from "@/lib/plans";
import { publicError } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

async function planFromSubscription(
  stripe: Stripe,
  subscriptionId: string | null
): Promise<PlanTier> {
  if (!subscriptionId) return "free";
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = sub.items.data[0]?.price?.id;
  return tierFromStripePriceId(priceId);
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("stripe_webhook_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

async function markProcessed(eventId: string, type: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("stripe_webhook_events").upsert({
    id: eventId,
    type,
    processed_at: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (await alreadyProcessed(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.metadata?.email ||
        session.customer_details?.email ||
        session.customer_email;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      let plan: PlanTier =
        session.metadata?.product === "woo_plus"
          ? "woo_plus"
          : session.metadata?.product === "woo_pro"
            ? "woo_pro"
            : "free";

      if (plan === "free" && subscriptionId) {
        plan = await planFromSubscription(stripe, subscriptionId);
      }

      if (plan !== "free") {
        await setUserPlan({
          email: email || null,
          stripeCustomerId: customerId,
          plan,
          stripeSubscriptionId: subscriptionId,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : null;
      await setUserPlan({
        stripeCustomerId: customerId,
        plan: "free",
        stripeSubscriptionId: null,
      });
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : null;
      const active = ["active", "trialing"].includes(sub.status);
      const priceId = sub.items.data[0]?.price?.id;
      const plan: PlanTier = active
        ? tierFromStripePriceId(priceId)
        : "free";

      await setUserPlan({
        stripeCustomerId: customerId,
        email: sub.metadata?.email || null,
        plan,
        stripeSubscriptionId: sub.id,
      });
    }

    try {
      await markProcessed(event.id, event.type);
    } catch (markErr) {
      // Table may not exist yet — still acknowledge to Stripe after processing
      console.warn("Webhook idempotency mark failed", markErr);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return publicError(500, "Webhook error", e);
  }
}
