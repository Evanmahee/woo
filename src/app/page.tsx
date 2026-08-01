"use client";

import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/lib/i18n/provider";

export default function HomePage() {
  const { t } = useI18n();

  const steps = [
    { n: "01", title: t.home.step1Title, body: t.home.step1Body },
    { n: "02", title: t.home.step2Title, body: t.home.step2Body },
    { n: "03", title: t.home.step3Title, body: t.home.step3Body },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-woo-gradient">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:py-6">
        <Link
          href="/"
          className="shrink-0 font-serif italic text-2xl tracking-tight text-white sm:text-3xl"
        >
          Woo
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          <LanguageSwitcher variant="dark" />
          <Link
            href="/pricing"
            className="hidden text-white/75 hover:text-white min-[420px]:inline"
          >
            {t.common.pricing}
          </Link>
          <Link
            href="/create"
            className="woo-btn !min-h-0 !px-3 !py-2 text-sm sm:!px-4 sm:!py-2.5"
          >
            {t.common.createAWoo}
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate min-h-[100svh] overflow-hidden sm:min-h-[min(92vh,920px)]">
          <HeroVideo src="/hero.mp4" />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3D1F2B]/75 via-[#3D1F2B]/35 to-[#3D1F2B]/40 sm:bg-gradient-to-r sm:from-[#3D1F2B]/55 sm:via-[#3D1F2B]/25 sm:to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#3D1F2B]/40 via-transparent to-[#3D1F2B]/20 sm:block"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-[max(5rem,calc(2rem+env(safe-area-inset-bottom)))] pt-24 sm:min-h-[min(92vh,920px)] sm:pb-20 lg:justify-center lg:pb-24">
            <p className="font-serif italic text-3xl text-white sm:text-5xl">
              Woo
            </p>
            <p className="mt-2 text-[10px] tracking-[0.22em] uppercase text-white/70 sm:text-xs">
              {t.home.tagline}
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-[2rem] font-bold leading-[1.12] text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85 sm:mt-4 sm:text-lg">
              {t.home.heroBody}
            </p>
            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link href="/create" className="woo-btn w-full sm:w-auto">
                {t.home.ctaPrimary}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/20 touch-manipulation sm:w-auto"
              >
                {t.home.ctaPricing}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-white/40 py-14 backdrop-blur-sm sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="woo-label text-center">{t.home.howLabel}</p>
            <h2 className="mt-3 text-center font-serif text-2xl font-bold text-woo-text sm:text-4xl">
              {t.home.howTitle}
            </h2>
            <div className="mt-10 grid gap-8 sm:mt-12 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="text-center md:text-left">
                  <span className="font-serif text-4xl italic text-woo-accent/40">
                    {step.n}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-bold text-woo-text">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-woo-muted md:mx-0">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="woo-card overflow-hidden p-6 sm:p-12">
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2">
              <div>
                <p className="woo-label">{t.home.plansLabel}</p>
                <h2 className="mt-3 font-serif text-2xl font-bold text-woo-text sm:text-4xl">
                  {t.home.plansTitle}{" "}
                  <span className="italic">{t.home.plansTitleItalic}</span>
                </h2>
                <p className="mt-4 text-sm text-woo-muted sm:text-base">
                  {t.home.plansBody}
                </p>
                <Link
                  href="/pricing"
                  className="woo-btn mt-6 inline-flex w-full sm:w-auto"
                >
                  {t.home.comparePlans}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                <div className="rounded-2xl bg-black/[0.03] p-4">
                  <p className="text-sm font-medium text-woo-text">
                    {t.plans.free}
                  </p>
                  <p className="mt-1 font-serif text-2xl">$0</p>
                  <p className="mt-1 text-[11px] text-woo-muted">
                    {t.home.freeHint}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/[0.03] p-4">
                  <p className="text-sm font-medium text-woo-text">
                    {t.plans.woo_plus}
                  </p>
                  <p className="mt-1 font-serif text-2xl">$2.99</p>
                  <p className="mt-1 text-[11px] text-woo-muted">
                    {t.home.plusHint}
                  </p>
                </div>
                <div className="rounded-2xl border border-woo-accent/40 bg-woo-accent-soft p-4">
                  <p className="text-sm font-medium text-woo-text">
                    {t.plans.woo_pro} ⭐
                  </p>
                  <p className="mt-1 font-serif text-2xl">$4.99</p>
                  <p className="mt-1 text-[11px] text-woo-muted">
                    {t.home.proHint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
