"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { ACTIVITIES, activityLabel, type ActivityKey } from "@/lib/activities";
import { useI18n } from "@/lib/i18n/provider";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plans";

export function PlanDropdown({
  value,
  onChange,
  userPlan,
  onUpgrade,
}: {
  value: ActivityKey | "";
  onChange: (key: ActivityKey) => void;
  userPlan: PlanTier;
  onUpgrade: (tier: "woo_plus" | "woo_pro", feature: string) => void;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = ACTIVITIES.find((a) => a.key === value);
  const listRef = useRef<HTMLDivElement>(null);

  // Lock page scroll while the sheet is open (fixes iOS jump / menu moving)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(activity: (typeof ACTIVITIES)[number]) {
    const locked =
      "premium" in activity &&
      activity.premium &&
      !PLAN_LIMITS[userPlan].surpriseDate;
    if (locked) {
      setOpen(false);
      onUpgrade("woo_pro", t.activities.surprise);
      return;
    }
    onChange(activity.key);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="woo-input flex items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-woo-text" : "text-woo-muted"}>
          {selected
            ? `${selected.emoji}  ${activityLabel(selected.key, locale)}`
            : t.create1.chooseActivity}
        </span>
        <span className="text-woo-muted">▾</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.create1.thePlan}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative z-10 flex max-h-[min(78dvh,560px)] w-full flex-col overflow-hidden rounded-t-3xl bg-zinc-900 shadow-2xl sm:max-h-[min(70vh,480px)] sm:max-w-md sm:rounded-3xl"
            style={{
              paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="font-medium text-white">{t.create1.thePlan}</p>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white touch-manipulation"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch]"
              role="listbox"
            >
              {ACTIVITIES.map((activity) => {
                const locked =
                  "premium" in activity &&
                  activity.premium &&
                  !PLAN_LIMITS[userPlan].surpriseDate;
                const isSelected = value === activity.key;
                return (
                  <button
                    key={activity.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => pick(activity)}
                    className={`flex min-h-[52px] w-full items-center gap-3 px-4 py-3.5 text-left text-sm touch-manipulation transition active:bg-white/10 ${
                      isSelected
                        ? "bg-woo-accent text-white"
                        : locked
                          ? "text-zinc-500"
                          : "text-zinc-100"
                    }`}
                  >
                    <span className="text-lg">{activity.emoji}</span>
                    <span className="flex-1">
                      {activityLabel(activity.key, locale)}
                    </span>
                    {locked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
                        <Lock className="h-3 w-3" /> {t.plans.woo_pro}
                      </span>
                    )}
                    {isSelected && !locked && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityCheckboxGrid({
  values,
  onChange,
  userPlan,
  onUpgrade,
  min = 2,
  max = 5,
}: {
  values: ActivityKey[];
  onChange: (next: ActivityKey[]) => void;
  userPlan: PlanTier;
  onUpgrade: (tier: "woo_plus" | "woo_pro", feature: string) => void;
  min?: number;
  max?: number;
}) {
  const { t, tf, locale } = useI18n();

  function toggle(key: ActivityKey, locked: boolean) {
    if (locked) {
      onUpgrade("woo_pro", t.activities.surprise);
      return;
    }
    if (values.includes(key)) {
      onChange(values.filter((v) => v !== key));
      return;
    }
    if (values.length >= max) return;
    onChange([...values, key]);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIVITIES.map((activity) => {
          const locked =
            "premium" in activity &&
            activity.premium &&
            !PLAN_LIMITS[userPlan].surpriseDate;
          const selected = values.includes(activity.key);
          return (
            <button
              key={activity.key}
              type="button"
              onClick={() => toggle(activity.key, !!locked)}
              className={`relative flex min-h-[88px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center touch-manipulation transition sm:px-3 sm:py-4 ${
                selected
                  ? "border-woo-accent bg-woo-accent-soft shadow-sm"
                  : locked
                    ? "border-black/5 bg-black/[0.02] opacity-60"
                    : "border-black/5 bg-white hover:border-woo-accent/30"
              }`}
            >
              <span className="text-2xl">{activity.emoji}</span>
              <span className="text-xs font-medium text-woo-text">
                {activityLabel(activity.key, locale)}
              </span>
              {locked && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-woo-accent-soft px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-woo-accent">
                  <Lock className="h-2.5 w-2.5" /> Pro
                </span>
              )}
              {selected && (
                <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-woo-accent text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-woo-muted">
        {tf(t.create1.pickRange, { min, max, count: values.length })}
      </p>
    </div>
  );
}
