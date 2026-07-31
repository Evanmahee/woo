"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { Logo } from "@/components/ui";
import {
  PLAN_LIMITS,
  readStoredPlan,
  writeStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";

const FEATURES = {
  free: [
    "1 Woo / month",
    "1 base theme",
    "I'll pick mode only",
    "Email delivery",
  ],
  woo_plus: [
    "5 Woos / month",
    "3 themes",
    "Let them pick 💫",
    "Email delivery",
  ],
  woo_pro: [
    "Unlimited Woos",
    "All themes",
    "Surprise Date ✨ (AI)",
    "Read receipts",
  ],
} as const;

export default function PricingPage() {
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [loadingTier, setLoadingTier] = useState<PaidTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [billingEmail, setBillingEmail] = useState("");
  const [billingMsg, setBillingMsg] = useState("");
  const [canceledBanner, setCanceledBanner] = useState(false);

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
  }, []);

  async function checkout(tier: PaidTier) {
    setLoadingTier(tier);
    setBillingMsg("");
    try {
      const email =
        billingEmail.trim() ||
        localStorage.getItem("woo_sender_email") ||
        undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setBillingMsg(data.error || "Checkout unavailable");
    } finally {
      setLoadingTier(null);
    }
  }

  async function openPortal(intent: "manage" | "cancel" = "manage") {
    const email = billingEmail.trim().toLowerCase();
    if (!email) {
      setBillingMsg("Entre l’email utilisé pour le paiement.");
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
      setBillingMsg(data.error || "Impossible d’ouvrir le portail Stripe.");
    } finally {
      setPortalLoading(false);
    }
  }

  async function cancelAtPeriodEnd() {
    const email = billingEmail.trim().toLowerCase();
    if (!email) {
      setBillingMsg("Entre l’email utilisé pour le paiement.");
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
      if (!res.ok) {
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
    <div className="min-h-screen bg-woo-gradient">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Logo />
        <Link href="/create" className="woo-btn text-sm">
          Create a Woo
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="text-center">
          <p className="woo-label">Pricing</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-woo-text sm:text-5xl">
            Soft start. Clear upgrade.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-woo-muted">
            Free to try. Woo+ if you want choice. Woo Pro when you want everything.
          </p>
        </div>

        {canceledBanner && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-woo-accent/20 bg-white/80 px-4 py-3 text-center text-sm text-woo-text">
            Abonnement mis à jour. Tu es sur Free — tu peux te réabonner quand tu
            veux.
          </div>
        )}

        <div className="mt-12 grid items-stretch gap-5 md:grid-cols-3 md:items-end">
          <div className="woo-card flex flex-col p-7">
            <p className="woo-label">Free</p>
            <p className="mt-2 font-serif text-4xl text-woo-text">$0</p>
            <p className="mt-1 text-sm text-woo-muted">Forever</p>
            <ul className="mt-7 flex-1 space-y-3">
              {FEATURES.free.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-woo-muted" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "free" ? (
              <span className="mt-8 block w-full rounded-2xl border border-black/5 py-3.5 text-center text-sm text-woo-muted">
                You&apos;re all set
              </span>
            ) : (
              <button
                type="button"
                className="woo-btn-secondary mt-8 w-full"
                disabled={portalLoading}
                onClick={() => openPortal("cancel")}
              >
                Se désabonner
              </button>
            )}
          </div>

          <div className="woo-card flex flex-col p-7">
            <p className="woo-label">Woo+</p>
            <p className="mt-2 font-serif text-4xl text-woo-text">
              $2.99<span className="text-lg text-woo-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-woo-muted">Cancel anytime</p>
            <ul className="mt-7 flex-1 space-y-3">
              {FEATURES.woo_plus.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-woo-muted" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "woo_plus" ? (
              <div className="mt-8 space-y-2">
                <span className="block w-full rounded-2xl border border-black/5 py-3.5 text-center text-sm text-woo-muted">
                  Current plan
                </span>
                <button
                  type="button"
                  className="woo-btn-secondary w-full text-sm"
                  disabled={portalLoading}
                  onClick={() => openPortal("cancel")}
                >
                  Se désabonner
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="woo-btn-secondary mt-8 w-full"
                disabled={loadingTier === "woo_plus"}
                onClick={() => checkout("woo_plus")}
              >
                {loadingTier === "woo_plus" ? "Redirecting…" : "Get Woo+"}
              </button>
            )}
          </div>

          <div className="woo-card relative flex scale-[1.02] flex-col border-2 border-woo-accent p-8 shadow-woo md:-mb-2 md:pb-9 md:pt-9">
            <span className="absolute right-4 top-4 rounded-full bg-woo-accent px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
              Most loved ⭐
            </span>
            <p className="woo-label">Woo Pro</p>
            <p className="mt-2 font-serif text-4xl text-woo-text">
              $4.99<span className="text-lg text-woo-muted">/mo</span>
            </p>
            <p className="mt-1 text-sm text-woo-muted">Cancel anytime</p>
            <ul className="mt-7 flex-1 space-y-3">
              {FEATURES.woo_pro.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-woo-text">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 fill-woo-accent text-woo-accent" />
                  {f}
                </li>
              ))}
            </ul>
            {userPlan === "woo_pro" ? (
              <div className="mt-8 space-y-2">
                <span className="block w-full rounded-2xl bg-woo-accent-soft py-3.5 text-center text-sm font-medium text-woo-text">
                  Current plan
                </span>
                <button
                  type="button"
                  className="woo-btn-secondary w-full text-sm"
                  disabled={portalLoading}
                  onClick={() => openPortal("cancel")}
                >
                  Se désabonner
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="woo-btn mt-8 w-full"
                disabled={loadingTier === "woo_pro"}
                onClick={() => checkout("woo_pro")}
              >
                {loadingTier === "woo_pro" ? "Redirecting…" : "Upgrade to Woo Pro"}
              </button>
            )}
          </div>
        </div>

        <div className="woo-card mx-auto mt-12 max-w-xl p-6 sm:p-8">
          <p className="woo-label">Paiement & abonnement</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-woo-text">
            Gérer ou se désabonner
          </h2>
          <p className="mt-2 text-sm text-woo-muted">
            Annule via Stripe. Aucun engagement — tu peux te réabonner à tout
            moment.
          </p>

          <label className="woo-label mb-2 mt-6 block">Email du paiement</label>
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
              {portalLoading ? "Ouverture…" : "Gérer mon abonnement"}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-woo-accent/30 bg-woo-accent-soft px-6 py-3.5 text-base font-medium text-woo-text transition hover:bg-woo-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={portalLoading || unsubLoading}
              onClick={() => openPortal("cancel")}
            >
              Se désabonner (Stripe)
            </button>
          </div>

          <button
            type="button"
            className="mt-3 w-full text-center text-sm text-woo-muted underline-offset-2 hover:text-woo-text hover:underline disabled:opacity-40"
            disabled={unsubLoading}
            onClick={cancelAtPeriodEnd}
          >
            {unsubLoading
              ? "…"
              : "Ou programmer l’arrêt à la fin de la période payée"}
          </button>

          {billingMsg && (
            <p className="mt-4 text-center text-sm text-woo-accent">{billingMsg}</p>
          )}

          {!isPaid && (
            <p className="mt-3 text-center text-xs text-woo-muted">
              Entre l’email utilisé sur Stripe si tu es déjà abonné.
            </p>
          )}
        </div>

        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-woo-muted">
                <th className="py-3 font-medium">Feature</th>
                <th className="py-3 font-medium">Free</th>
                <th className="py-3 font-medium">Woo+</th>
                <th className="py-3 font-medium text-woo-accent">Woo Pro</th>
              </tr>
            </thead>
            <tbody className="text-woo-text">
              {[
                ["Woos / month", "1", "5", "Unlimited"],
                ["Themes", "1", "3", "All"],
                ['"Let them pick" mode', "—", "✓", "✓"],
                ["Surprise Date ✨", "—", "—", "✓"],
                ["Read receipts", "—", "—", "✓"],
              ].map(([feature, free, plus, pro]) => (
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

        <p className="mt-6 text-center text-xs text-woo-muted">
          Limits: Free {PLAN_LIMITS.free.woosPerMonth}/mo · Woo+{" "}
          {PLAN_LIMITS.woo_plus.woosPerMonth}/mo · Woo Pro unlimited
        </p>
      </main>
    </div>
  );
}
