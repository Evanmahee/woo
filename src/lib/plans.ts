export const PLAN_LIMITS = {
  free: {
    woosPerMonth: 1,
    themes: 1,
    recipientChoice: false,
    surpriseDate: false,
    readReceipts: false,
    label: "Free",
    price: 0,
  },
  woo_plus: {
    woosPerMonth: 5,
    themes: 3,
    recipientChoice: true,
    surpriseDate: false,
    readReceipts: false,
    label: "Woo+",
    price: 2.99,
  },
  woo_pro: {
    woosPerMonth: Infinity,
    themes: Infinity,
    recipientChoice: true,
    surpriseDate: true,
    readReceipts: true,
    label: "Woo Pro",
    price: 4.99,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;
export type PaidTier = "woo_plus" | "woo_pro";

export function normalizePlan(value: unknown): PlanTier {
  if (value === "woo_plus" || value === "woo_pro" || value === "free") {
    return value;
  }
  // Legacy is_pro migration fallback
  if (value === true || value === "true") return "woo_pro";
  return "free";
}

export function planRank(plan: PlanTier): number {
  if (plan === "woo_pro") return 2;
  if (plan === "woo_plus") return 1;
  return 0;
}

export function hasPlanAtLeast(current: PlanTier, required: PlanTier): boolean {
  return planRank(current) >= planRank(required);
}

/** Theme index (0-based) allowed for this plan */
export function themeAllowedForPlan(themeIndex: number, plan: PlanTier): boolean {
  const limit = PLAN_LIMITS[plan].themes;
  if (limit === Infinity) return true;
  return themeIndex >= 0 && themeIndex < limit;
}

/** Minimum tier required to unlock a theme by its catalog index */
export function minPlanForThemeIndex(themeIndex: number): PlanTier {
  if (themeIndex < PLAN_LIMITS.free.themes) return "free";
  if (themeIndex < PLAN_LIMITS.woo_plus.themes) return "woo_plus";
  return "woo_pro";
}

export function stripePriceIdForTier(tier: PaidTier): string | undefined {
  if (tier === "woo_plus") return process.env.STRIPE_PRICE_ID_WOO_PLUS;
  return process.env.STRIPE_PRICE_ID_WOO_PRO;
}

export function tierFromStripePriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_ID_WOO_PRO) return "woo_pro";
  if (priceId === process.env.STRIPE_PRICE_ID_WOO_PLUS) return "woo_plus";
  return "free";
}

export const PLAN_STORAGE_KEY = "woo_plan";

export function readStoredPlan(): PlanTier {
  if (typeof window === "undefined") return "free";
  const stored = localStorage.getItem(PLAN_STORAGE_KEY);
  if (stored === "woo_plus" || stored === "woo_pro" || stored === "free") {
    return stored;
  }
  // Migrate old flag
  if (localStorage.getItem("woo_is_pro") === "true") return "woo_pro";
  return "free";
}

export function writeStoredPlan(plan: PlanTier) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_STORAGE_KEY, plan);
  localStorage.setItem("woo_is_pro", plan === "woo_pro" ? "true" : "false");
}
