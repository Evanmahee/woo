"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarHeart, Lock } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DateCarousel } from "@/components/DateCarousel";
import { TimeCarousel } from "@/components/TimeCarousel";
import { Logo, UpgradeModal } from "@/components/ui";
import { ActivityCheckboxGrid, PlanDropdown } from "@/components/ActivityPicker";
import type { ActivityKey } from "@/lib/activities";
import { useI18n } from "@/lib/i18n/provider";
import {
  PLAN_LIMITS,
  readStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";
import { DRAFT_STORAGE_KEY, type ActivityMode, type CreateDraft } from "@/lib/types";

export default function CreateStep1() {
  const router = useRouter();
  const { t } = useI18n();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<ActivityMode>("fixed");
  const [plan, setPlan] = useState<ActivityKey | "">("");
  const [proposed, setProposed] = useState<ActivityKey[]>([]);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [upgradeTier, setUpgradeTier] = useState<PaidTier>("woo_plus");
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as CreateDraft;
        setDate(draft.date || "");
        setTime(draft.time || "");
        setMode(draft.activityMode || "fixed");
        setPlan(draft.plan || "");
        setProposed(draft.proposedActivities || []);
      }
    } catch {
      /* ignore */
    }
    setUserPlan(readStoredPlan());
  }, []);

  function openUpgrade(tier: PaidTier, feature?: string) {
    setUpgradeTier(tier);
    setUpgradeFeature(feature);
    setShowUpgrade(true);
  }

  function continueNext() {
    setError("");
    if (!date || !time) {
      setError(t.create1.errDateTime);
      return;
    }
    if (mode === "recipient_choice" && !PLAN_LIMITS[userPlan].recipientChoice) {
      openUpgrade("woo_plus", t.create1.letThemPick);
      return;
    }
    if (mode === "fixed" && !plan) {
      setError(t.create1.errPlan);
      return;
    }
    if (mode === "recipient_choice" && (proposed.length < 2 || proposed.length > 5)) {
      setError(t.create1.errProposed);
      return;
    }

    const draft: CreateDraft = {
      date,
      time,
      activityMode: mode,
      plan: mode === "fixed" ? plan : "",
      proposedActivities: mode === "recipient_choice" ? proposed : [],
    };
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    router.push("/create/step-2");
  }

  const canRecipientChoice = PLAN_LIMITS[userPlan].recipientChoice;

  return (
    <div className="min-h-screen overflow-x-hidden bg-woo-gradient px-4 py-6 pb-36 pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-8 sm:pb-32">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <Logo className="text-2xl sm:text-3xl" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="soft" />
            <span className="woo-label shrink-0">{t.create1.step}</span>
          </div>
        </div>

        <div className="woo-card p-5 sm:p-8">
          <div className="woo-badge-icon mb-5">
            <CalendarHeart className="h-5 w-5 text-woo-accent" />
          </div>

          <h1 className="font-serif text-[1.75rem] font-bold leading-tight text-woo-text sm:text-4xl">
            {t.create1.title}
          </h1>
          <p className="mt-2 text-sm text-woo-muted sm:text-base">
            {t.create1.subtitle}
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="woo-label mb-2 block">{t.create1.date}</label>
              <DateCarousel value={date} onChange={setDate} />
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create1.time}</label>
              <TimeCarousel value={time} onChange={setTime} />
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create1.whoPicks}</label>
              <div className="grid grid-cols-1 gap-2 rounded-2xl bg-black/[0.03] p-1.5 min-[380px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("fixed")}
                  className={`min-h-[48px] rounded-xl px-3 py-2.5 text-sm font-medium touch-manipulation transition ${
                    mode === "fixed"
                      ? "bg-white text-woo-text shadow-sm"
                      : "text-woo-muted"
                  }`}
                >
                  {t.create1.illPick}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canRecipientChoice) {
                      openUpgrade("woo_plus", t.create1.letThemPick);
                      return;
                    }
                    setMode("recipient_choice");
                  }}
                  className={`relative min-h-[48px] rounded-xl px-3 py-2.5 text-sm font-medium touch-manipulation transition ${
                    mode === "recipient_choice"
                      ? "bg-white text-woo-text shadow-sm"
                      : "text-woo-muted"
                  }`}
                >
                  {t.create1.letThemPick}
                  {!canRecipientChoice && (
                    <span className="mt-1 flex items-center justify-center gap-0.5 text-[9px] uppercase tracking-wide text-woo-accent">
                      <Lock className="h-2.5 w-2.5" /> {t.plans.woo_plus}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="woo-label mb-2 block">{t.create1.thePlan}</label>
              {mode === "fixed" ? (
                <PlanDropdown
                  value={plan}
                  onChange={setPlan}
                  userPlan={userPlan}
                  onUpgrade={openUpgrade}
                />
              ) : (
                <ActivityCheckboxGrid
                  values={proposed}
                  onChange={setProposed}
                  userPlan={userPlan}
                  onUpgrade={openUpgrade}
                />
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-woo-accent">{error}</p>
          )}
        </div>
      </div>

      <div className="woo-bottom-bar">
        <div className="mx-auto max-w-md">
          <button type="button" className="woo-btn w-full" onClick={continueNext}>
            {t.create1.continue}
          </button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        tier={upgradeTier}
        feature={upgradeFeature}
      />
    </div>
  );
}
