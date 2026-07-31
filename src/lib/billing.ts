import { getSupabaseAdmin } from "./supabase";
import {
  normalizePlan,
  PLAN_LIMITS,
  type PlanTier,
} from "./plans";
import type { UsersBilling } from "./types";

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function coerceBilling(row: Record<string, unknown>): UsersBilling {
  const plan =
    normalizePlan(row.plan) !== "free"
      ? normalizePlan(row.plan)
      : row.is_pro
        ? "woo_pro"
        : "free";

  return {
    id: String(row.id),
    email: String(row.email),
    plan,
    is_pro: plan === "woo_pro",
    stripe_customer_id: (row.stripe_customer_id as string) || null,
    stripe_subscription_id: (row.stripe_subscription_id as string) || null,
    woos_sent_this_month: Number(row.woos_sent_this_month || 0),
    month_key: (row.month_key as string) || null,
    created_at: String(row.created_at || ""),
  };
}

export async function getOrCreateBilling(email: string): Promise<UsersBilling> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();
  const month = currentMonthKey();

  const { data: existing, error } = await supabase
    .from("users_billing")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;

  if (!existing) {
    const { data: created, error: insertError } = await supabase
      .from("users_billing")
      .insert({
        email: normalized,
        plan: "free",
        woos_sent_this_month: 0,
        month_key: month,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return coerceBilling(created as Record<string, unknown>);
  }

  let row = existing as Record<string, unknown>;

  // Backfill plan from legacy is_pro if needed
  if (!row.plan && row.is_pro) {
    const { data: migrated } = await supabase
      .from("users_billing")
      .update({ plan: "woo_pro" })
      .eq("id", row.id)
      .select("*")
      .single();
    if (migrated) row = migrated as Record<string, unknown>;
  }

  if (row.month_key !== month) {
    const { data: reset, error: resetError } = await supabase
      .from("users_billing")
      .update({ woos_sent_this_month: 0, month_key: month })
      .eq("id", row.id)
      .select("*")
      .single();

    if (resetError) throw resetError;
    return coerceBilling(reset as Record<string, unknown>);
  }

  return coerceBilling(row);
}

export async function canSendWoo(email: string): Promise<{
  allowed: boolean;
  plan: PlanTier;
  remaining: number;
  billing: UsersBilling;
}> {
  const billing = await getOrCreateBilling(email);
  const limit = PLAN_LIMITS[billing.plan].woosPerMonth;
  if (limit === Infinity) {
    return { allowed: true, plan: billing.plan, remaining: Infinity, billing };
  }
  const remaining = Math.max(0, limit - (billing.woos_sent_this_month || 0));
  return {
    allowed: remaining > 0,
    plan: billing.plan,
    remaining,
    billing,
  };
}

export async function incrementWooCount(email: string): Promise<void> {
  const billing = await getOrCreateBilling(email);
  const supabase = getSupabaseAdmin();
  await supabase
    .from("users_billing")
    .update({ woos_sent_this_month: (billing.woos_sent_this_month || 0) + 1 })
    .eq("id", billing.id);
}

export async function setUserPlan(opts: {
  email?: string | null;
  stripeCustomerId?: string | null;
  plan: PlanTier;
  stripeSubscriptionId?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = {
    plan: opts.plan,
    // Keep legacy column in sync if it still exists
    is_pro: opts.plan === "woo_pro",
  };
  if (opts.stripeSubscriptionId !== undefined) {
    updates.stripe_subscription_id = opts.stripeSubscriptionId;
  }
  if (opts.stripeCustomerId) {
    updates.stripe_customer_id = opts.stripeCustomerId;
  }

  if (opts.email) {
    const billing = await getOrCreateBilling(opts.email);
    await supabase.from("users_billing").update(updates).eq("id", billing.id);
    return;
  }

  if (opts.stripeCustomerId) {
    await supabase
      .from("users_billing")
      .update(updates)
      .eq("stripe_customer_id", opts.stripeCustomerId);
  }
}
