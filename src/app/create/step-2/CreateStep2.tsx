"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo, UpgradeModal } from "@/components/ui";
import { formatActivityLabel } from "@/lib/activities";
import { useI18n } from "@/lib/i18n/provider";
import {
  minPlanForThemeIndex,
  readStoredPlan,
  themeAllowedForPlan,
  writeStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";
import { THEMES } from "@/lib/themes";
import { DRAFT_STORAGE_KEY, type CreateDraft } from "@/lib/types";

export default function CreateStep2() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("default");
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [upgradeTier, setUpgradeTier] = useState<PaidTier>("woo_pro");
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        router.replace("/create");
        return;
      }
      setDraft(JSON.parse(raw) as CreateDraft);
    } catch {
      router.replace("/create");
    }
    setUserPlan(readStoredPlan());
    const savedEmail = localStorage.getItem("woo_sender_email");
    const savedName = localStorage.getItem("woo_sender_name");
    if (savedEmail) setSenderEmail(savedEmail);
    if (savedName) setSenderName(savedName);
  }, [router]);

  function openUpgrade(tier: PaidTier, feature?: string) {
    setUpgradeTier(tier);
    setUpgradeFeature(feature);
    setShowUpgrade(true);
  }

  async function sendWoo() {
    if (!draft) return;
    setError("");
    if (!senderName.trim() || !senderEmail.trim()) {
      setError(t.create2.errSender);
      return;
    }
    if (!recipientName.trim() || !recipientEmail.trim()) {
      setError(t.create2.errRecipient);
      return;
    }

    setLoading(true);
    try {
      const createRes = await fetch("/api/woos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: senderName.trim(),
          sender_email: senderEmail.trim(),
          recipient_name: recipientName.trim(),
          recipient_email: recipientEmail.trim(),
          date: draft.date,
          time: draft.time,
          activity_mode: draft.activityMode,
          plan: draft.activityMode === "fixed" ? draft.plan : null,
          proposed_activities:
            draft.activityMode === "recipient_choice" ? draft.proposedActivities : null,
          custom_message: message.trim() || null,
          theme,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        if (
          createData.code === "QUOTA_EXCEEDED" ||
          createData.code === "PLUS_REQUIRED" ||
          createData.code === "PRO_REQUIRED"
        ) {
          openUpgrade(
            createData.required_tier === "woo_plus" ? "woo_plus" : "woo_pro",
            createData.code === "QUOTA_EXCEEDED" ? "More Woos" : undefined
          );
        }
        throw new Error(createData.error || "Failed to create Woo");
      }

      localStorage.setItem("woo_sender_email", senderEmail.trim().toLowerCase());
      localStorage.setItem("woo_sender_name", senderName.trim());
      if (createData.plan) {
        writeStoredPlan(createData.plan);
        setUserPlan(createData.plan);
      }

      const sendRes = await fetch(`/api/woos/${createData.woo.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_token: createData.send_token }),
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        console.warn(sendData.error);
      }

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.setItem(
        "woo_success",
        JSON.stringify({ id: createData.woo.id, plan: createData.plan || userPlan })
      );
      router.push("/success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-woo-gradient">
        <p className="text-woo-muted">{t.common.loading}</p>
      </div>
    );
  }

  const planSummary =
    draft.activityMode === "fixed"
      ? formatActivityLabel(draft.plan, locale)
      : draft.proposedActivities
          .map((k) => formatActivityLabel(k, locale))
          .join(" · ");

  return (
    <div className="min-h-screen overflow-x-hidden bg-woo-gradient px-4 py-6 pb-36 pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-8 sm:pb-32">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <Logo className="text-2xl sm:text-3xl" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="soft" />
            <span className="woo-label shrink-0">{t.create2.step}</span>
          </div>
        </div>

        <div className="woo-card p-5 sm:p-8">
          <div className="woo-badge-icon mb-5">
            <Mail className="h-5 w-5 text-woo-accent" />
          </div>

          <h1 className="font-serif text-[1.75rem] font-bold leading-tight text-woo-text sm:text-4xl">
            {t.create2.title}
          </h1>
          <p className="mt-2 text-sm text-woo-muted sm:text-base">
            {t.create2.subtitle}
          </p>

          <div className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="woo-label mb-2 block">{t.create2.yourName}</label>
                <input
                  className="woo-input"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Camille"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="woo-label mb-2 block">{t.create2.yourEmail}</label>
                <input
                  type="email"
                  className="woo-input"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create2.recipientName}</label>
              <input
                className="woo-input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Alex"
              />
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create2.recipientEmail}</label>
              <input
                type="email"
                className="woo-input"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="alex@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create2.message}</label>
              <textarea
                className="woo-input min-h-[100px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.create2.messagePlaceholder}
              />
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create2.theme}</label>
              <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
                {THEMES.map((th, index) => {
                  const allowed = themeAllowedForPlan(index, userPlan);
                  const required = minPlanForThemeIndex(index);
                  const selected = theme === th.key;
                  const themeLabel =
                    t.themes[th.key as keyof typeof t.themes] ?? th.label;
                  return (
                    <button
                      key={th.key}
                      type="button"
                      onClick={() => {
                        if (!allowed) {
                          openUpgrade(
                            required === "free" ? "woo_plus" : (required as PaidTier),
                            t.create2.theme
                          );
                          return;
                        }
                        setTheme(th.key);
                      }}
                      className={`relative overflow-hidden rounded-2xl border-2 p-1 transition ${
                        selected ? "border-woo-accent" : "border-transparent"
                      }`}
                    >
                      <div
                        className="aspect-square rounded-xl"
                        style={{ background: th.preview }}
                      />
                      <p className="mt-1 truncate text-center text-[10px] text-woo-muted">
                        {themeLabel}
                      </p>
                      {!allowed && (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/55">
                          <Lock className="h-3.5 w-3.5 text-woo-text" />
                          <span className="text-[9px] font-medium uppercase tracking-wide text-woo-accent">
                            {t.plans[required as keyof typeof t.plans]}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-woo-accent-soft/60 p-4 text-sm text-woo-text">
              <p className="woo-label mb-2">{t.create2.recap}</p>
              <p>
                <strong>{draft.date}</strong> at <strong>{draft.time}</strong>
              </p>
              <p className="mt-1 text-woo-muted">{planSummary}</p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-woo-accent">{error}</p>
          )}
        </div>
      </div>

      <div className="woo-bottom-bar">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            className="woo-btn w-full"
            disabled={loading}
            onClick={sendWoo}
          >
            {loading ? t.create2.sending : t.create2.send}
          </button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        email={senderEmail}
        tier={upgradeTier}
        feature={upgradeFeature}
      />
    </div>
  );
}
