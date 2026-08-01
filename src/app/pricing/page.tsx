"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import {
  PLAN_LIMITS,
  readStoredPlan,
  writeStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";

export default function PricingPage() {
  const { t } = useI18n();
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [billingEmail, setBillingEmail] = useState("");
  const [billingMsg, setBillingMsg] = useState("");
  const [canceledBanner, setCanceledBanner] = useState(false);

  const comparisonRows = [
    [t.pricing.features.woos, "1", "5", t.pricing.unlimited],
    [t.pricing.features.themes, "1", "3", t.pricing.all],
    [t.pricing.features.pick, "—", "✓", "✓"],
    [t.pricing.features.surprise, "—", "—", "✓"],
    [t.pricing.features.receipts, "—", "—", "✓"],
  ] as const;

  useEffect(() => {
    setUserPlan(readStoredPlan());
    const saved = localStorage.getItem("woo_sender_email");
    if (saved) setBillingEmail(saved);
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "1") {
      setCanceledBanner(true);
      writeStoredPlan("free");
      setUserPlan("free");
    }

    const portalToken = params.get("portal_token");
    const intent =
      params.get("intent") === "cancel" ? ("cancel" as const) : ("manage" as const);
    const unsubToken = params.get("unsub_token");

    async function consumeTokens() {
      if (portalToken) {
        setPortalLoading(true);
        try {
          const emailHint =
            saved || localStorage.getItem("woo_sender_email") || "";
          try {
            const payloadJson = (() => {
              const part = portalToken.split(".")[0];
              const pad = part + "=".repeat((4 - (part.length % 4)) % 4);
              return atob(pad.replace(/-/g, "+").replace(/_/g, "/"));
            })();
            const payload = JSON.parse(payloadJson) as { email?: string };
            if (payload.email) setBillingEmail(payload.email);
            const res = await fetch("/api/portal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: payload.email || emailHint,
                intent,
                token: portalToken,
              }),
            });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
              return;
            }
            setBillingMsg(data.error || data.message || "Portal link expired.");
          } catch {
            setBillingMsg("Invalid portal confirmation link.");
          }
        } finally {
          setPortalLoading(false);
          window.history.replaceState({}, "", "/pricing");
        }
      }

      if (unsubToken) {
        setUnsubLoading(true);
        try {
          try {
            const payloadJson = (() => {
              const part = unsubToken.split(".")[0];
              const pad = part + "=".repeat((4 - (part.length % 4)) % 4);
              return atob(pad.replace(/-/g, "+").replace(/_/g, "/"));
            })();
            const payload = JSON.parse(payloadJson) as { email?: string };
            if (payload.email) setBillingEmail(payload.email);
            const res = await fetch("/api/unsubscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: payload.email,
                token: unsubToken,
              }),
            });
            const data = await res.json();
            setBillingMsg(data.message || data.error || "Done.");
          } catch {
            setBillingMsg("Invalid unsubscription link.");
          }
        } finally {
          setUnsubLoading(false);
          window.history.replaceState({}, "", "/pricing");
        }
      }
    }

    void consumeTokens();
  }, []);

  async function checkout(tier: PaidTier) {
    setLoadingTier(tier);
    setBillingMsg("");
    try {
      const email =
        billingEmail.trim() ||
        localStorage.getItem("woo_sender_email") ||
        undefined;
      if (email) localStorage.setItem("woo_sender_email", email);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setBillingMsg(
        data.error ||
          (res.ok
            ? "Checkout unavailable"
            : `Checkout failed (${res.status}). Retry in a moment.`)
      );
    } catch {
      setBillingMsg("Network error — check your connection and try again.");
    } finally {
      setLoadingTier(null);
    }
  }

  async function openPortal(intent: "manage" | "cancel" = "manage") {
    const email = billingEmail.trim().toLowerCase();
    if (!email) {
      setBillingMsg(t.pricing.needEmail);
      return;
    }
    setPortalLoading(true);
    setBillingMsg("");
    try {
      localStorage.setItem("woo_sender_email", email);
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, intent }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setBillingMsg(
        data.message || data.error || "Impossible d’ouvrir le portail Stripe."
      );
    } finally {
      setPortalLoading(false);
    }
  }

  async function cancelAtPeriodEnd() {
    const email = billingEmail.trim().toLowerCase();
    if (!email) {
      setBillingMsg(t.pricing.needEmail);
      return;
    }
    setUnsubLoading(true);
    setBillingMsg("");
    try {
      localStorage.setItem("woo_sender_email", email);
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok && !data.requires_confirmation) {
        setBillingMsg(data.error || "Désabonnement impossible.");
        return;
      }
      setBillingMsg(data.message || "Désabonnement programmé.");
    } finally {
      setUnsubLoading(false);
    }
  }

  const isPaid = userPlan === "woo_plus" || userPlan === "woo_pro";

  return (
    <div className="min-h-screen overflow-x-hidden bg-woo-gradient">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:py-6">
        <Logo className="text-2xl sm:text-3xl" />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="light" />
          <Link
            href="/create"
            className="woo-btn !min-h-0 shrink-0 !px-3 !py-2 text-sm sm:!px-6 sm:!py-3.5"
          >
            {t.common.createAWoo}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[max(5rem,env(safe-area-inset-bottom))] pt-6 sm:pb-20 sm:pt-8">
        <div className="text-center px-1">
          <p className="woo-label">{t.pricing.label}</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-woo-text sm:text-5xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-woo-muted sm:text-base">
            {t.pricing.subtitle}
          </p>
        </div>

        {canceledBanner && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-woo-accent/20 bg-white/80 px-4 py-3 text-center text-sm text-woo-text">
            {t.pricing.canceledBanner}
          </div>
        )}

        {billingMsg && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-woo-accent/30 bg-woo-accent-soft px-4 py-3 text-center text-sm text-woo-text">
            {billingMsg}
          </div>
        )}

        <div className="mt-8 grid items-stretch gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3 md:items-end">
          <div className="woo-card relative order-1 flex flex-col border-2 border-woo-accent p-6 shadow-woo sm:p-7 md:order-3 md:scale-[1.02] md:-mb-2 md:p-8 md:pb-9 md:pt-9">
            <span className="absolute right-3 top-3 rounded-full bg-woo-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white sm:right-4 sm:top-4 sm:px-3">
              {t.pricing.mostLoved}
            </span>
            <p className="woo-label">{t.plans.woo_pro}</p>
            <p className="mt-2 font-serif text-3xl text-woo-text sm:text-4xl">
              $4.99<span className="text-lg text-woo-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-woo-muted">{t.common.cancelAnytime}</p>
            <ul className="mt-6 flex-1 space-y-3 sm:mt-7">
              {t.pricing.proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 fill-woo-accent text-woo-accent" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "woo_pro" ? (
              <div className="mt-8 space-y-2">
                <span className="block w-full rounded-2xl bg-woo-accent-soft py-3.5 text-center text-sm font-medium text-woo-text">
                  {t.common.currentPlan}
                </span>
                <button
                  type="button"
                  className="woo-btn-secondary w-full text-sm"
                  disabled={portalLoading}
                  onClick={() => openPortal("cancel")}
                >
                  {t.pricing.unsubscribe}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="woo-btn mt-8 w-full"
                disabled={loadingTier === "woo_pro"}
                onClick={() => checkout("woo_pro")}
              >
                {loadingTier === "woo_pro"
                  ? t.common.redirecting
                  : t.pricing.upgradePro}
              </button>
            )}
          </div>

          <div className="woo-card order-2 flex flex-col p-6 sm:p-7 md:order-1">
            <p className="woo-label">{t.plans.free}</p>
            <p className="mt-2 font-serif text-3xl text-woo-text sm:text-4xl">$0</p>
            <p className="mt-1 text-sm text-woo-muted">{t.common.forever}</p>
            <ul className="mt-7 flex-1 space-y-3">
              {t.pricing.freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-woo-muted" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "free" ? (
              <Link href="/create" className="woo-btn-secondary mt-8 block w-full text-center">
                {t.common.createAWoo}
              </Link>
            ) : (
              <button
                type="button"
                className="woo-btn-secondary mt-8 w-full"
                disabled={portalLoading}
                onClick={() => openPortal("cancel")}
              >
                {t.pricing.unsubscribe}
              </button>
            )}
          </div>

          <div className="woo-card order-3 flex flex-col p-6 sm:p-7 md:order-2">
            <p className="woo-label">{t.plans.woo_plus}</p>
            <p className="mt-2 font-serif text-3xl text-woo-text sm:text-4xl">
              $2.99<span className="text-lg text-woo-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-woo-muted">{t.common.cancelAnytime}</p>
            <ul className="mt-6 flex-1 space-y-3 sm:mt-7">
              {t.pricing.plusFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-woo-muted" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "woo_plus" ? (
              <div className="mt-8 space-y-2">
                <span className="block w-full rounded-2xl border border-black/5 py-3.5 text-center text-sm text-woo-muted">
                  {t.common.currentPlan}
                </span>
                <button
                  type="button"
                  className="woo-btn-secondary w-full text-sm"
                  disabled={portalLoading}
                  onClick={() => openPortal("cancel")}
                >
                  {t.pricing.unsubscribe}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="woo-btn-secondary mt-8 w-full"
                disabled={loadingTier === "woo_plus"}
                onClick={() => checkout("woo_plus")}
              >
                {loadingTier === "woo_plus" ? t.common.redirecting : t.pricing.getPlus}
              </button>
            )}
          </div>
        </div>

        <div className="woo-card mx-auto mt-12 max-w-xl p-6 sm:p-8">
          <p className="woo-label">{t.pricing.billingTitle}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-woo-text">
            {t.pricing.billingHeading}
          </h2>
          <p className="mt-2 text-sm text-woo-muted">{t.pricing.billingBody}</p>

          <label className="woo-label mb-2 mt-6 block">{t.pricing.billingEmail}</label>
          <input
            type="email"
            className="woo-input"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            placeholder="toi@email.com"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="woo-btn-secondary flex-1"
              disabled={portalLoading}
              onClick={() => openPortal("manage")}
            >
              {portalLoading ? t.pricing.opening : t.pricing.manage}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-woo-accent/30 bg-woo-accent-soft px-6 py-3.5 text-base font-medium text-woo-text transition hover:bg-woo-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={portalLoading || unsubLoading}
              onClick={() => openPortal("cancel")}
            >
              {t.pricing.unsubStripe}
            </button>
          </div>

          <button
            type="button"
            className="mt-3 w-full text-center text-sm text-woo-muted underline-offset-2 hover:text-woo-text hover:underline disabled:opacity-40"
            disabled={unsubLoading}
            onClick={cancelAtPeriodEnd}
          >
            {unsubLoading ? "…" : t.pricing.unsubSchedule}
          </button>

          {billingMsg && (
            <p className="mt-4 text-center text-sm text-woo-accent">{billingMsg}</p>
          )}

          {!isPaid && (
            <p className="mt-3 text-center text-xs text-woo-muted">
              {t.pricing.enterEmailHint}
            </p>
          )}
        </div>

        <div className="mt-14 -mx-4 px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="space-y-3 sm:hidden">
            {comparisonRows.map(([feature, free, plus, pro]) => (
              <div
                key={feature}
                className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3"
              >
                <p className="text-sm font-medium text-woo-text">{feature}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-woo-muted">{t.plans.free}</p>
                    <p className="mt-0.5 text-woo-text">{free}</p>
                  </div>
                  <div>
                    <p className="text-woo-muted">{t.plans.woo_plus}</p>
                    <p className="mt-0.5 text-woo-text">{plus}</p>
                  </div>
                  <div>
                    <p className="text-woo-accent">{t.plans.woo_pro}</p>
                    <p className="mt-0.5 font-medium text-woo-text">{pro}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-woo-muted">
                  <th className="py-3 font-medium">{t.pricing.feature}</th>
                  <th className="py-3 font-medium">{t.plans.free}</th>
                  <th className="py-3 font-medium">{t.plans.woo_plus}</th>
                  <th className="py-3 font-medium text-woo-accent">{t.plans.woo_pro}</th>
                </tr>
              </thead>
              <tbody className="text-woo-text">
                {comparisonRows.map(([feature, free, plus, pro]) => (
                  <tr key={feature} className="border-b border-black/5">
                    <td className="py-3">{feature}</td>
                    <td className="py-3 text-woo-muted">{free}</td>
                    <td className="py-3 text-woo-muted">{plus}</td>
                    <td className="py-3 font-medium">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-woo-muted">
          Limits: {t.plans.free} {PLAN_LIMITS.free.woosPerMonth}/mo · {t.plans.woo_plus}{" "}
          {PLAN_LIMITS.woo_plus.woosPerMonth}/mo · {t.plans.woo_pro} {t.pricing.unlimited}
        </p>
      </main>
    </div>
  );
}
