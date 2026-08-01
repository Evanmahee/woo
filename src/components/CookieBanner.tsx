"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COOKIE_CONSENT_KEY,
  type CookieConsentChoice,
} from "@/lib/legal-info";
import { useI18n } from "@/lib/i18n/provider";
import Link from "next/link";

type CookieConsentContextValue = {
  choice: CookieConsentChoice | null;
  openSettings: () => void;
  acceptAll: () => void;
  necessaryOnly: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

function applyGtagConsent(choice: CookieConsentChoice) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  const granted = choice === "all";
  window.gtag("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [forceOpen, setForceOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (saved === "all" || saved === "necessary") {
        setChoice(saved);
        applyGtagConsent(saved);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: CookieConsentChoice) => {
    setChoice(next);
    setForceOpen(false);
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, next);
    } catch {
      /* ignore */
    }
    applyGtagConsent(next);
  }, []);

  const acceptAll = useCallback(() => persist("all"), [persist]);
  const necessaryOnly = useCallback(() => persist("necessary"), [persist]);
  const openSettings = useCallback(() => setForceOpen(true), []);

  const value = useMemo(
    () => ({ choice, openSettings, acceptAll, necessaryOnly }),
    [choice, openSettings, acceptAll, necessaryOnly]
  );

  const showBanner = ready && (forceOpen || choice === null);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {showBanner ? <CookieBannerUI /> : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}

function CookieBannerUI() {
  const { t } = useI18n();
  const { acceptAll, necessaryOnly } = useCookieConsent();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-3xl border border-black/10 bg-white/95 p-5 shadow-woo backdrop-blur sm:flex-row sm:items-end sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold text-woo-text">
            {t.cookies.bannerTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-woo-muted">
            {t.cookies.bannerBody}{" "}
            <Link href="/cookies" className="text-woo-accent underline">
              {t.cookies.learnMore}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="woo-btn-secondary !min-h-[44px] !py-2.5 text-sm"
            onClick={necessaryOnly}
          >
            {t.cookies.necessaryOnly}
          </button>
          <button
            type="button"
            className="woo-btn !min-h-[44px] !py-2.5 text-sm"
            onClick={acceptAll}
          >
            {t.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
