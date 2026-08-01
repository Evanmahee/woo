"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Logo, UpgradeModal } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import {
  normalizePlan,
  readStoredPlan,
  writeStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";

export default function SuccessClient({
  verifiedPaid = false,
  verifiedTier,
}: {
  verifiedPaid?: boolean;
  verifiedTier?: PaidTier;
}) {
  const { t, tf } = useI18n();
  const [link, setLink] = useState("");
  const [plan, setPlan] = useState<PlanTier>("free");
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<PaidTier>("woo_pro");
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (verifiedPaid && verifiedTier) {
      setUpgraded(true);
      writeStoredPlan(verifiedTier);
      setPlan(verifiedTier);
    } else if (params.get("upgraded") === "1") {
      setUpgraded(true);
      const tier = normalizePlan(params.get("tier"));
      const paid = tier === "woo_plus" || tier === "woo_pro" ? tier : "woo_pro";
      writeStoredPlan(paid);
      setPlan(paid);
    } else {
      setPlan(readStoredPlan());
    }

    try {
      const raw = sessionStorage.getItem("woo_success");
      if (raw) {
        const data = JSON.parse(raw) as {
          id: string;
          plan?: PlanTier;
          isPro?: boolean;
        };
        setLink(`${window.location.origin}/w/${data.id}`);
        if (data.plan) {
          setPlan(normalizePlan(data.plan));
          writeStoredPlan(normalizePlan(data.plan));
        } else if (data.isPro) {
          setPlan("woo_pro");
          writeStoredPlan("woo_pro");
        }
      }
    } catch {
      /* ignore */
    }
  }, [verifiedPaid, verifiedTier]);

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const upsell =
    plan === "free"
      ? {
          line: t.success.upsellFree,
          tier: "woo_pro" as PaidTier,
          cta: t.success.seePlans,
        }
      : plan === "woo_plus"
        ? {
            line: t.success.upsellPlus,
            tier: "woo_pro" as PaidTier,
            cta: t.success.upgradePro,
          }
        : null;

  const planLabel = t.plans[plan as keyof typeof t.plans];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-woo-gradient px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-md">
        <Logo className="text-2xl sm:text-3xl" />

        <div className="woo-card mt-8 p-6 text-center sm:mt-10 sm:p-8">
          <p className="text-5xl">{upgraded ? "✨" : "💌"}</p>
          <h1 className="mt-4 font-serif text-2xl font-bold text-woo-text sm:text-3xl">
            {upgraded
              ? tf(t.success.welcome, { plan: planLabel })
              : t.success.onItsWay}
          </h1>
          <p className="mt-3 text-sm text-woo-muted sm:text-base">
            {upgraded
              ? plan === "woo_pro"
                ? t.success.unlockedPro
                : t.success.unlockedPlus
              : t.success.emailed}
          </p>

          {link && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-2">
              <input
                readOnly
                value={link}
                className="min-w-0 flex-1 truncate bg-transparent px-2 text-sm text-woo-text outline-none sm:px-3"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 rounded-xl bg-woo-accent px-3 py-2 text-white touch-manipulation"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/create" className="woo-btn w-full">
              {t.success.sendAnother}
            </Link>
            <Link href="/" className="woo-btn-secondary w-full">
              {t.common.backHome}
            </Link>
          </div>
        </div>

        {upsell && (
          <div className="mt-6 rounded-3xl border border-woo-accent/20 bg-white/70 p-6 text-center backdrop-blur">
            <p className="font-serif text-xl text-woo-text">{upsell.line}</p>
            <button
              type="button"
              className="woo-btn mt-4"
              onClick={() => {
                if (plan === "free") {
                  window.location.href = "/pricing";
                  return;
                }
                setUpgradeTier(upsell.tier);
                setShowUpgrade(true);
              }}
            >
              {upsell.cta}
            </button>
          </div>
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        tier={upgradeTier}
      />
    </div>
  );
}
