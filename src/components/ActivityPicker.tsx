"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock } from "lucide-react";
import { ACTIVITIES, type ActivityKey } from "@/lib/activities";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = ACTIVITIES.find((a) => a.key === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="woo-input flex items-center justify-between text-left"
      >
        <span className={selected ? "text-woo-text" : "text-woo-muted"}>
          {selected ? `${selected.emoji}  ${selected.label}` : "Choose an activity…"}
        </span>
        <span className="text-woo-muted">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl bg-zinc-900/95 py-2 shadow-2xl backdrop-blur-md">
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
                onClick={() => {
                  if (locked) {
                    onUpgrade("woo_pro", "Surprise Date");
                    return;
                  }
                  onChange(activity.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "bg-woo-accent text-white"
                    : locked
                      ? "cursor-pointer text-zinc-500 hover:bg-white/5"
                      : "text-zinc-100 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{activity.emoji}</span>
                <span className="flex-1">{activity.label}</span>
                {locked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300">
                    <Lock className="h-3 w-3" /> Woo Pro
                  </span>
                )}
                {isSelected && !locked && <Check className="h-4 w-4" />}
              </button>
            );
          })}
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
  function toggle(key: ActivityKey, locked: boolean) {
    if (locked) {
      onUpgrade("woo_pro", "Surprise Date");
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
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition ${
                selected
                  ? "border-woo-accent bg-woo-accent-soft shadow-sm"
                  : locked
                    ? "border-black/5 bg-black/[0.02] opacity-60"
                    : "border-black/5 bg-white hover:border-woo-accent/30"
              }`}
            >
              <span className="text-2xl">{activity.emoji}</span>
              <span className="text-xs font-medium text-woo-text">{activity.label}</span>
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
        Pick {min}–{max} options · {values.length} selected
      </p>
    </div>
  );
}
