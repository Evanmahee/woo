"use client";

import Link from "next/link";
import type { PaidTier } from "@/lib/plans";
import { PLAN_LIMITS } from "@/lib/plans";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-serif italic text-3xl text-woo-text tracking-tight ${className}`}
    >
      Woo
    </Link>
  );
}

export function StepBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="woo-badge-icon" aria-hidden>
      {children ?? icon}
    </div>
  );
}

const TIER_COPY: Record<
  PaidTier,
  { title: string; blurb: (feature?: string) => string; cta: string }
> = {
  woo_plus: {
    title: "Woo+",
    blurb: (feature) =>
      feature
        ? `${feature} is included with Woo+ — 5 Woos/mo, 3 themes, and “Let them pick”.`
        : "5 Woos/mo, 3 themes, and “Let them pick” for $2.99/mo.",
    cta: "Upgrade to Woo+",
  },
  woo_pro: {
    title: "Woo Pro",
    blurb: (feature) =>
      feature
        ? `${feature} unlocks with Woo Pro — unlimited Woos, all themes, Surprise Date & read receipts.`
        : "Unlimited Woos, all themes, Surprise Date ✨ and read receipts for $4.99/mo.",
    cta: "Upgrade to Woo Pro ✨",
  },
};

export function UpgradeModal({
  open,
  onClose,
  email,
  tier = "woo_pro",
  feature,
}: {
  open: boolean;
  onClose: () => void;
  email?: string;
  tier?: PaidTier;
  feature?: string;
}) {
  if (!open) return null;

  const copy = TIER_COPY[tier];

  async function startCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email || undefined,
        tier,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="woo-card w-full max-w-md p-8 text-center">
        <p className="font-serif italic text-3xl text-woo-text">{copy.title}</p>
        <p className="mt-1 text-sm text-woo-muted">
          ${PLAN_LIMITS[tier].price}/mo
        </p>
        <p className="mt-3 text-woo-muted">{copy.blurb(feature)}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className="woo-btn w-full" onClick={startCheckout}>
            {copy.cta}
          </button>
          <button type="button" className="woo-btn-secondary w-full" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
