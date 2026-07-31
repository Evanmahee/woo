"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarHeart, Clock, Lock } from "lucide-react";
import { Logo, UpgradeModal } from "@/components/ui";
import { ActivityCheckboxGrid, PlanDropdown } from "@/components/ActivityPicker";
import type { ActivityKey } from "@/lib/activities";
import {
  PLAN_LIMITS,
  readStoredPlan,
  type PaidTier,
  type PlanTier,
} from "@/lib/plans";
import { DRAFT_STORAGE_KEY, type ActivityMode, type CreateDraft } from "@/lib/types";

export default function CreateStep1() {
  const router = useRouter();
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
      setError("Please pick a date and time.");
      return;
    }
    if (mode === "recipient_choice" && !PLAN_LIMITS[userPlan].recipientChoice) {
      openUpgrade("woo_plus", "Let them pick");
      return;
    }
    if (mode === "fixed" && !plan) {
      setError("Please choose a plan.");
      return;
    }
    if (mode === "recipient_choice" && (proposed.length < 2 || proposed.length > 5)) {
      setError("Select between 2 and 5 activities for them to choose from.");
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
    <div className="min-h-screen bg-woo-gradient px-4 py-8 pb-32">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="woo-label">Step 1 of 2</span>
        </div>

        <div className="woo-card p-6 sm:p-8">
          <div className="woo-badge-icon mb-5">
            <CalendarHeart className="h-5 w-5 text-woo-accent" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-woo-text sm:text-4xl">
            When works for you?
          </h1>
          <p className="mt-2 text-woo-muted">
            Pick a date and time — I&apos;ll make it special.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="woo-label mb-2 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="woo-input"
              />
            </div>

            <div>
              <label className="woo-label mb-2 block">Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="woo-input pr-12"
                />
                <Clock className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-woo-muted" />
              </div>
            </div>

            <div>
              <label className="woo-label mb-2 block">Who picks the plan?</label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.03] p-1.5">
                <button
                  type="button"
                  onClick={() => setMode("fixed")}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    mode === "fixed"
                      ? "bg-white text-woo-text shadow-sm"
                      : "text-woo-muted"
                  }`}
                >
                  I&apos;ll pick 🎯
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canRecipientChoice) {
                      openUpgrade("woo_plus", "Let them pick");
                      return;
                    }
                    setMode("recipient_choice");
                  }}
                  className={`relative rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    mode === "recipient_choice"
                      ? "bg-white text-woo-text shadow-sm"
                      : "text-woo-muted"
                  }`}
                >
                  Let them pick 💫
                  {!canRecipientChoice && (
                    <span className="mt-1 flex items-center justify-center gap-0.5 text-[9px] uppercase tracking-wide text-woo-accent">
                      <Lock className="h-2.5 w-2.5" /> Woo+
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="woo-label mb-2 block">The Plan</label>
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

      <div className="fixed bottom-0 left-0 right-0 border-t border-black/5 bg-white/80 p-4 backdrop-blur-md">
        <div className="mx-auto max-w-md">
          <button type="button" className="woo-btn w-full" onClick={continueNext}>
            Continue
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
