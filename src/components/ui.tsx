"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
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
  const { t, tf } = useI18n();

  if (!open) return null;

  const title = t.plans[tier];
  const blurb = feature
    ? tf(tier === "woo_plus" ? t.upgrade.plusFeature : t.upgrade.proFeature, {
        feature,
      })
    : tier === "woo_plus"
      ? t.upgrade.plusBlurb
      : t.upgrade.proBlurb;
  const cta = tier === "woo_plus" ? t.upgrade.plusCta : t.upgrade.proCta;

  async function startCheckout() {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          tier,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      window.location.href = "/pricing";
    } catch {
      window.location.href = "/pricing";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="woo-card w-full max-w-md rounded-b-none p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:rounded-3xl sm:p-8 sm:pb-8">
        <p className="font-serif italic text-3xl text-woo-text">{title}</p>
        <p className="mt-1 text-sm text-woo-muted">
          ${PLAN_LIMITS[tier].price}/mo
        </p>
        <p className="mt-3 text-sm text-woo-muted sm:text-base">{blurb}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className="woo-btn w-full" onClick={startCheckout}>
            {cta}
          </button>
          <button type="button" className="woo-btn-secondary w-full" onClick={onClose}>
            {t.common.maybeLater}
          </button>
        </div>
      </div>
    </div>
  );
}
