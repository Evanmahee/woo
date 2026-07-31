"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ACTIVITIES, getActivity } from "@/lib/activities";

type Mode = "fixed" | "recipient_choice" | "done_accept" | "done_choice" | "done_alt";

const SHORTLIST = ["coffee", "dinner", "fast_food", "movie"] as const;

export default function RespondPreviewPage() {
  const [mode, setMode] = useState<Mode>("fixed");
  const [selected, setSelected] = useState<string | null>(null);
  const fixed = getActivity("dinner");

  return (
    <div className="min-h-screen bg-woo-gradient px-4 py-8">
      <div className="mx-auto max-w-lg">
        <p className="woo-label text-center">Aperçu · réponse destinataire</p>
        <h1 className="mt-2 text-center font-serif text-2xl font-bold text-woo-text">
          Ce qui s&apos;affiche après le clic sur le lien
        </h1>

        {/* Mode switcher */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {(
            [
              ["fixed", "Plan fixé"],
              ["recipient_choice", "Ils choisissent"],
              ["done_accept", "Après accept"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setSelected(null);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                mode === key
                  ? "bg-woo-accent text-white"
                  : "bg-white/70 text-woo-muted hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card = /w/[id] */}
        <div className="woo-card mt-8 p-6 sm:p-8">
          <p className="text-center font-serif italic text-3xl text-woo-text">Woo</p>
          <p className="mt-1 text-center text-xs tracking-[0.2em] uppercase text-woo-muted">
            To woo.
          </p>

          {mode.startsWith("done") ? (
            <div className="mt-8 text-center">
              <p className="text-5xl">💌</p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-woo-text">
                You&apos;re in!
              </h2>
              <p className="mt-3 text-woo-muted">
                {mode === "done_choice"
                  ? "Alex picked: Fast Food Run 🍔 — Camille is notified by email."
                  : "Camille is notified: Alex accepted Dinner Date 🍽️."}
              </p>
            </div>
          ) : (
            <>
              <h2 className="mt-8 text-center font-serif text-3xl font-bold leading-tight text-woo-text">
                Camille wants to woo you
              </h2>
              <p className="mt-3 text-center text-woo-muted">
                on <strong className="text-woo-text">2026-08-14</strong> at{" "}
                <strong className="text-woo-text">19:30</strong>
              </p>

              <blockquote className="mt-6 rounded-2xl bg-woo-accent-soft/70 px-5 py-4 text-center font-serif italic text-woo-text">
                “Been thinking about this all week… just say yes.”
              </blockquote>

              {mode === "fixed" && fixed && (
                <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white/60 py-6">
                  <span className="text-4xl">{fixed.emoji}</span>
                  <span className="font-medium text-woo-text">{fixed.label}</span>
                </div>
              )}

              {mode === "recipient_choice" && (
                <div className="mt-8">
                  <p className="woo-label mb-3 text-center">Pick your favorite</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SHORTLIST.map((key) => {
                      const activity = ACTIVITIES.find((a) => a.key === key)!;
                      const isSelected = selected === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelected(key)}
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
                  disabled={mode === "recipient_choice" && !selected}
                  onClick={() =>
                    setMode(mode === "fixed" ? "done_accept" : "done_choice")
                  }
                >
                  Oui
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white/60 p-5 text-sm text-woo-muted backdrop-blur">
          <p className="font-medium text-woo-text">Une seule réponse</p>
          <p className="mt-2">
            <strong className="text-woo-text">Oui</strong> — c’est tout. Pas de non,
            pas d’autre horaire.
          </p>
        </div>
      </div>
    </div>
  );
}
