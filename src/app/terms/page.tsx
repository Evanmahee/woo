"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import { COMPANY } from "@/lib/legal-info";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-woo-gradient px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <LanguageSwitcher variant="light" />
        </div>
        <article className="woo-card mt-8 space-y-6 p-6 text-sm leading-relaxed text-woo-muted sm:p-10">
          <div>
            <p className="woo-label">{t.common.terms}</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-woo-text">
              Terms &amp; Conditions
            </h1>
            <p className="mt-2 text-xs text-woo-muted">
              Last updated: 1 August 2026
            </p>
          </div>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              1. Service description
            </h2>
            <p className="mt-3">
              Woo, operated by {COMPANY.legalName}, lets you plan and send date
              invitations by email and link. Plans include Free (limited monthly
              Woos), Woo+ (higher limits and recipient choice), and Woo Pro
              (unlimited Woos, all themes, Surprise Date and related features),
              as described on the{" "}
              <Link href="/pricing" className="text-woo-accent underline">
                pricing page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              2. Minimum age &amp; capacity
            </h2>
            <p className="mt-3">
              You must be at least <strong className="text-woo-text">18 years
              old</strong> and have legal capacity to enter into a contract to
              use paid features (Woo+ / Woo Pro). By subscribing, you confirm
              you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              3. Subscriptions &amp; cancellation
            </h2>
            <p className="mt-3">
              Paid plans are billed on a recurring monthly cycle via Stripe
              until cancelled. You can manage or cancel through the Stripe
              Customer Portal (from the pricing page) or by contacting{" "}
              <a
                className="text-woo-accent underline"
                href={`mailto:${COMPANY.email}`}
              >
                {COMPANY.email}
              </a>
              . After cancellation, access to paid features ends at the end of
              the paid period (or immediately if you cancel immediately). Your
              invitation history is not automatically deleted — see our{" "}
              <Link href="/privacy" className="text-woo-accent underline">
                Privacy Policy
              </Link>{" "}
              for erasure rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              4. Right of withdrawal (EU consumers)
            </h2>
            <p className="mt-3">
              If you are a consumer in the EU/EEA, you generally have 14 days to
              withdraw from a distance contract for digital services. However,
              by checking the required consent box at Stripe Checkout and
              starting to use Woo immediately, you expressly request early
              performance and{" "}
              <strong className="text-woo-text">
                waive your 14-day right of withdrawal
              </strong>{" "}
              for that purchase, to the extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              5. Acceptable use
            </h2>
            <p className="mt-3">
              You may not use Woo to spam, harass, impersonate others, send
              unlawful content, or abuse email delivery or AI features. We may
              suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              6. Limitation of liability
            </h2>
            <p className="mt-3">
              To the fullest extent permitted by law, {COMPANY.legalName} is not
              liable for indirect damages, lost profits, or damages arising from
              third-party services (Stripe, email providers, hosting) or from
              content you or recipients create. Nothing in these terms limits
              liability that cannot be limited under Spanish or EU consumer law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              7. Governing law
            </h2>
            <p className="mt-3">
              These Terms are governed by the laws of Spain. Subject to
              mandatory consumer protections, disputes shall be submitted to the
              courts of Málaga, Spain.
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
