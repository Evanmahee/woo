"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Logo, UpgradeModal } from "@/components/ui";
import {
  normalizePlan,
  PLAN_LIMITS,
  readStoredPlan,
  writeStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";

export default function SuccessPage() {
  const [link, setLink] = useState("");
  const [plan, setPlan] = useState<PlanTier>("free");
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<PaidTier>("woo_pro");
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
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
        const data = JSON.parse(raw) as { id: string; plan?: PlanTier; isPro?: boolean };
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
  }, []);

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const upsell =
    plan === "free"
      ? {
          line: "Send unlimited Woos and let them pick with Woo+ or Woo Pro.",
          tier: "woo_pro" as PaidTier,
          cta: "See plans",
        }
      : plan === "woo_plus"
        ? {
            line: "Unlock Surprise Date and unlimited themes with Woo Pro.",
            tier: "woo_pro" as PaidTier,
            cta: "Upgrade to Woo Pro",
          }
        : null;

  return (
    <div className="flex min-h-screen flex-col bg-woo-gradient px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Logo />

        <div className="woo-card mt-10 p-8 text-center">
          <p className="text-5xl">{upgraded ? "✨" : "💌"}</p>
          <h1 className="mt-4 font-serif text-3xl font-bold text-woo-text">
            {upgraded
              ? `Welcome to ${PLAN_LIMITS[plan].label}`
              : "Your Woo is on its way"}
          </h1>
          <p className="mt-3 text-woo-muted">
            {upgraded
              ? plan === "woo_pro"
                ? "Unlimited Woos, all themes, Surprise Date and read receipts are unlocked."
                : "5 Woos/mo, 3 themes, and “Let them pick” are unlocked."
              : "We've emailed the invitation. Share the link too if you like."}
          </p>

          {link && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-2">
              <input
                readOnly
                value={link}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-woo-text outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 rounded-xl bg-woo-accent px-3 py-2 text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/create" className="woo-btn w-full">
              Send another Woo
            </Link>
            <Link href="/" className="woo-btn-secondary w-full">
              Back home
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
