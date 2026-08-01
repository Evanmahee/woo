"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import { COMPANY } from "@/lib/legal-info";

export default function PrivacyPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("delete_token");
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
    if (!token || !emailParam) return;

    async function confirmDelete() {
      setLoading(true);
      try {
        const res = await fetch("/api/privacy/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailParam, token }),
        });
        const data = await res.json();
        setMsg(data.message || data.error || "Done.");
      } catch {
        setMsg("Something went wrong.");
      } finally {
        setLoading(false);
        window.history.replaceState({}, "", "/privacy");
      }
    }
    void confirmDelete();
  }, []);

  async function requestDelete() {
    const value = email.trim().toLowerCase();
    if (!value) {
      setMsg(t.privacy.enterEmail);
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/privacy/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, role: "both" }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || "Check your email.");
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-woo-gradient px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <LanguageSwitcher variant="light" />
        </div>
        <div className="woo-card mt-8 p-6 sm:p-10">
          <p className="woo-label">{t.privacy.label}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-woo-text">
            {t.privacy.title}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-woo-muted">
            <p>{t.privacy.body1}</p>
            <p>{t.privacy.retention}</p>
            <p>
              {t.privacy.contact}{" "}
              <a
                className="text-woo-accent underline"
                href={`mailto:${COMPANY.email}`}
              >
                {COMPANY.email}
              </a>{" "}
              for manual requests (we aim to respond within 30 days).
            </p>
          </div>

          <div className="mt-8 border-t border-black/5 pt-6">
            <h2 className="font-serif text-xl font-bold text-woo-text">
              {t.privacy.deleteTitle}
            </h2>
            <p className="mt-2 text-sm text-woo-muted">{t.privacy.deleteBody}</p>
            <label className="woo-label mb-2 mt-4 block">{t.privacy.email}</label>
            <input
              type="email"
              className="woo-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
            <button
              type="button"
              className="woo-btn mt-4 w-full sm:w-auto"
              disabled={loading}
              onClick={requestDelete}
            >
              {loading ? "…" : t.privacy.requestDelete}
            </button>
            {msg && (
              <p className="mt-4 text-sm text-woo-accent">{msg}</p>
            )}
          </div>

          <p className="mt-8 text-center text-sm">
            <Link href="/" className="text-woo-muted hover:text-woo-text">
              ← {t.common.backHome}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
