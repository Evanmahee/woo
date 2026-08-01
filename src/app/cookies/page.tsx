"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import { useCookieConsent } from "@/components/CookieBanner";
import { COMPANY } from "@/lib/legal-info";

export default function CookiesPage() {
  const { t } = useI18n();
  const { openSettings } = useCookieConsent();

  return (
    <div className="min-h-screen bg-woo-gradient px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <LanguageSwitcher variant="light" />
        </div>
        <article className="woo-card mt-8 space-y-6 p-6 text-sm leading-relaxed text-woo-muted sm:p-10">
          <div>
            <p className="woo-label">{t.common.cookies}</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-woo-text">
              Cookie Policy
            </h1>
            <p className="mt-2 text-xs text-woo-muted">
              Last updated: 1 August 2026 · {COMPANY.legalName}
            </p>
          </div>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              1. What we use
            </h2>
            <p className="mt-3">
              Woo uses cookies and similar technologies as described below.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              2. Necessary cookies
            </h2>
            <p className="mt-3">
              Required for the service to work (for example session and security
              related to Supabase / application state). These do not require
              consent under applicable EU rules because they are strictly
              necessary.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              3. Advertising cookies
            </h2>
            <p className="mt-3">
              If you choose “Accept all”, we enable Google Ads conversion
              tracking to measure whether an ad click led to a paid signup. This
              may set advertising cookies. These are{" "}
              <strong className="text-woo-text">not</strong> loaded for
              conversion measurement until you consent. See Google’s policies
              for more detail on how Google processes data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              4. How to change your choice
            </h2>
            <p className="mt-3">
              You can reopen the cookie banner at any time via{" "}
              <button
                type="button"
                className="text-woo-accent underline"
                onClick={openSettings}
              >
                {t.cookies.settings}
              </button>{" "}
              in the footer, or using the button below.
            </p>
            <button
              type="button"
              className="woo-btn-secondary mt-4"
              onClick={openSettings}
            >
              {t.cookies.settings}
            </button>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              5. Contact
            </h2>
            <p className="mt-3">
              Questions:{" "}
              <a
                className="text-woo-accent underline"
                href={`mailto:${COMPANY.email}`}
              >
                {COMPANY.email}
              </a>
            </p>
          </section>

          <p className="pt-4 text-center">
            <Link href="/" className="text-woo-muted hover:text-woo-text">
              ← {t.common.backHome}
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}
