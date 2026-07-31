"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ACTIVITIES, formatActivityLabel, getActivity } from "@/lib/activities";
import { getTheme } from "@/lib/themes";
import type { Woo } from "@/lib/types";

export default function WooRecipientClient({ woo }: { woo: Woo }) {
  const theme = getTheme(woo.theme);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(woo.status !== "pending");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  const proposed = useMemo(() => {
    const keys = Array.isArray(woo.proposed_activities)
      ? woo.proposed_activities
      : [];
    return keys
      .map((k) => ACTIVITIES.find((a) => a.key === k))
      .filter(Boolean);
  }, [woo.proposed_activities]);

  const fixedActivity = getActivity(woo.plan);
  const isDark = woo.theme === "midnight";

  async function respond(payload: Record<string, unknown>) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/woos/${woo.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
      setStatusMsg(data.summary || "Response sent!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: theme.pageBg }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-woo sm:p-8"
        style={{ background: theme.cardBg }}
      >
        <p
          className={`text-center font-serif italic text-3xl ${
            isDark ? "text-woo-text" : "text-woo-text"
          }`}
        >
          Woo
        </p>
        <p className="mt-1 text-center text-xs tracking-[0.2em] uppercase text-woo-muted">
          To woo.
        </p>

        {done ? (
          <div className="mt-8 text-center">
            <p className="text-5xl">💌</p>
            <h1 className="mt-4 font-serif text-3xl font-bold text-woo-text">
              {woo.status === "proposed_alt" || statusMsg.includes("suggested")
                ? "Suggestion sent"
                : "You're in!"}
            </h1>
            <p className="mt-3 text-woo-muted">
              {statusMsg ||
                (woo.status === "accepted"
                  ? `You chose ${formatActivityLabel(woo.chosen_activity || woo.plan)}`
                  : woo.status === "proposed_alt"
                    ? `You suggested ${woo.proposed_alt_date} at ${String(woo.proposed_alt_time || "").slice(0, 5)}`
                    : "We've let them know.")}
            </p>
            {woo.chosen_activity && (
              <p className="mt-4 text-lg text-woo-text">
                {formatActivityLabel(woo.chosen_activity)}
              </p>
            )}
          </div>
        ) : (
          <>
            <h1 className="mt-8 text-center font-serif text-3xl font-bold leading-tight text-woo-text sm:text-4xl">
              {woo.sender_name} wants to woo you
            </h1>
            <p className="mt-3 text-center text-woo-muted">
              on <strong className="text-woo-text">{woo.date}</strong> at{" "}
              <strong className="text-woo-text">
                {String(woo.time).slice(0, 5)}
              </strong>
            </p>

            {woo.custom_message && (
              <blockquote className="mt-6 rounded-2xl bg-woo-accent-soft/70 px-5 py-4 text-center font-serif italic text-woo-text">
                “{woo.custom_message}”
              </blockquote>
            )}

            {woo.activity_mode === "fixed" && fixedActivity && (
              <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white/60 py-6">
                <span className="text-4xl">{fixedActivity.emoji}</span>
                <span className="font-medium text-woo-text">
                  {fixedActivity.label}
                </span>
              </div>
            )}

            {woo.activity_mode === "recipient_choice" && (
              <div className="mt-8">
                <p className="woo-label mb-3 text-center">Pick your favorite</p>
                <div className="grid grid-cols-2 gap-2">
                  {proposed.map((activity) => {
                    if (!activity) return null;
                    const isSelected = selected === activity.key;
                    return (
                      <button
                        key={activity.key}
                        type="button"
                        onClick={() => setSelected(activity.key)}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-5 transition ${
                          isSelected
                            ? "border-woo-accent bg-woo-accent-soft"
                            : "border-black/5 bg-white hover:border-woo-accent/40"
                        }`}
                      >
                        <span className="text-3xl">{activity.emoji}</span>
                        <span className="text-sm font-medium text-woo-text">
                          {activity.label}
                        </span>
                        {isSelected && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-woo-accent text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                className="woo-btn w-full text-lg tracking-wide"
                style={{ background: theme.accent }}
                disabled={
                  loading ||
                  (woo.activity_mode === "recipient_choice" && !selected)
                }
                onClick={() =>
                  woo.activity_mode === "fixed"
                    ? respond({ action: "accept" })
                    : respond({
                        action: "choose_activity",
                        chosen_activity: selected,
                      })
                }
              >
                Oui
              </button>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-woo-accent">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
