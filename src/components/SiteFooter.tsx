"use client";

import Link from "next/link";
import { useCookieConsent } from "@/components/CookieBanner";
import { useI18n } from "@/lib/i18n/provider";
import { COMPANY } from "@/lib/legal-info";

export function SiteFooter() {
  const { t } = useI18n();
  const { openSettings } = useCookieConsent();

  return (
    <footer className="border-t border-black/5 bg-white/30 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div>
          <p className="font-serif italic text-xl text-woo-text">Woo</p>
          <p className="mt-1 text-xs text-woo-muted">{t.home.footerNote}</p>
        </div>
        <div className="flex max-w-xl flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-woo-muted sm:justify-end">
          <Link href="/pricing" className="hover:text-woo-text">
            {t.common.pricing}
          </Link>
          <Link href="/create" className="hover:text-woo-text">
            {t.common.create}
          </Link>
          <Link href="/privacy" className="hover:text-woo-text">
            {t.common.privacy}
          </Link>
          <Link href="/legal" className="hover:text-woo-text">
            {t.common.legal}
          </Link>
          <Link href="/terms" className="hover:text-woo-text">
            {t.common.terms}
          </Link>
          <Link href="/cookies" className="hover:text-woo-text">
            {t.common.cookies}
          </Link>
          <button
            type="button"
            className="hover:text-woo-text"
            onClick={openSettings}
          >
            {t.cookies.settings}
          </button>
          <a
            href={`mailto:${COMPANY.email}`}
            className="hover:text-woo-text"
          >
            {t.common.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}
