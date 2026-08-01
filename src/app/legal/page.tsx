"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui";
import { useI18n } from "@/lib/i18n/provider";
import { COMPANY } from "@/lib/legal-info";

export default function LegalPage() {
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
            <p className="woo-label">{t.common.legal}</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-woo-text">
              Legal Notice
            </h1>
            <p className="mt-2 text-xs text-woo-muted">
              Aviso Legal · Last updated: 1 August 2026
            </p>
          </div>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              1. Identification
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-woo-text">Legal name:</strong>{" "}
                {COMPANY.legalName}
              </li>
              <li>
                <strong className="text-woo-text">Tax ID (NIF/CIF):</strong>{" "}
                {COMPANY.taxId}
              </li>
              <li>
                <strong className="text-woo-text">Registered address:</strong>{" "}
                {COMPANY.address}
              </li>
              <li>
                <strong className="text-woo-text">Contact:</strong>{" "}
                <a
                  className="text-woo-accent underline"
                  href={`mailto:${COMPANY.email}`}
                >
                  {COMPANY.email}
                </a>
              </li>
              <li>
                <strong className="text-woo-text">Website:</strong>{" "}
                https://{COMPANY.domain}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              2. Purpose of the website
            </h2>
            <p className="mt-3">
              The website https://{COMPANY.domain} (“Woo”) provides an online
              service to plan and send date invitations via email and shareable
              links, including optional paid subscription tiers (Woo+ and Woo
              Pro).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              3. Applicable law
            </h2>
            <p className="mt-3">
              This website and the legal relationship with users are governed by
              the laws of Spain. Subject to mandatory consumer protections, the
              courts of Málaga, Spain, shall have jurisdiction over disputes
              arising from the use of this website.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              4. Intellectual property
            </h2>
            <p className="mt-3">
              All content on this website — including texts, design, graphics,
              logos, the “Woo” name and brand elements, and software — is owned
              by {COMPANY.legalName} or used under licence. Reproduction,
              distribution, or modification without prior written authorisation
              is prohibited, except for personal, non-commercial use of the
              service as intended.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-woo-text">
              5. Liability
            </h2>
            <p className="mt-3">
              We strive to keep the site available and accurate, but we do not
              guarantee uninterrupted access, error-free content, or that the
              service will meet every expectation. To the fullest extent
              permitted by law, {COMPANY.legalName} is not liable for damages
              arising from temporary unavailability, third-party services
              (email, payments, hosting), or misuse of invitation features by
              users.
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
