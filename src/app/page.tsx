import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Pick a plan",
    body: "Choose a date, a time, and an activity — or leave a shortlist for them.",
  },
  {
    n: "02",
    title: "Send a Woo",
    body: "We email a gorgeous invitation link. No app download required.",
  },
  {
    n: "03",
    title: "They respond",
    body: "Accept, pick from your shortlist, or suggest another time. You're notified.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-woo-gradient">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link
          href="/"
          className="font-serif italic text-3xl tracking-tight text-white"
        >
          Woo
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-white/75 hover:text-white">
            Pricing
          </Link>
          <Link href="/create" className="woo-btn !px-4 !py-2.5 text-sm">
            Create a Woo
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero — full-bleed cinematic video */}
        <section className="relative isolate min-h-[min(92vh,920px)] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#3D1F2B]/55 via-[#3D1F2B]/25 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#3D1F2B]/40 via-transparent to-[#3D1F2B]/20"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[min(92vh,920px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-10 sm:pb-20 lg:justify-center lg:pb-24">
            <p className="font-serif italic text-4xl text-white sm:text-5xl">Woo</p>
            <p className="mt-2 text-xs tracking-[0.22em] uppercase text-white/70">
              To woo.
            </p>
            <h1 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              The easiest way to ask.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              Plan a beautiful date invitation. Send it as a link. They accept,
              choose, or suggest another time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create" className="woo-btn">
                Send your first Woo 💌
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                See pricing
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-black/5 bg-white/40 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4">
            <p className="woo-label text-center">How it works</p>
            <h2 className="mt-3 text-center font-serif text-3xl font-bold text-woo-text sm:text-4xl">
              Three soft steps
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="text-center md:text-left">
                  <span className="font-serif text-4xl italic text-woo-accent/40">
                    {step.n}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-bold text-woo-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-woo-muted">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="woo-card overflow-hidden p-8 sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="woo-label">Plans</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-woo-text sm:text-4xl">
                  Free to try.{" "}
                  <span className="italic">Pro to woo often.</span>
                </h2>
                <p className="mt-4 text-woo-muted">
                  Free is one Woo a month. Woo+ adds choice. Woo Pro is the
                  obvious pick — unlimited, every theme, Surprise Date.
                </p>
                <Link href="/pricing" className="woo-btn mt-6 inline-flex">
                  Compare plans
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-black/[0.03] p-4">
                  <p className="text-sm font-medium text-woo-text">Free</p>
                  <p className="mt-1 font-serif text-2xl">$0</p>
                  <p className="mt-1 text-[11px] text-woo-muted">1 Woo / mo</p>
                </div>
                <div className="rounded-2xl bg-black/[0.03] p-4">
                  <p className="text-sm font-medium text-woo-text">Woo+</p>
                  <p className="mt-1 font-serif text-2xl">$2.99</p>
                  <p className="mt-1 text-[11px] text-woo-muted">5 Woos · pick</p>
                </div>
                <div className="rounded-2xl border border-woo-accent/40 bg-woo-accent-soft p-4">
                  <p className="text-sm font-medium text-woo-text">Woo Pro ⭐</p>
                  <p className="mt-1 font-serif text-2xl">$4.99</p>
                  <p className="mt-1 text-[11px] text-woo-muted">Unlimited · AI</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white/30 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="font-serif italic text-xl text-woo-text">Woo</p>
          <div className="flex gap-6 text-sm text-woo-muted">
            <Link href="/pricing" className="hover:text-woo-text">
              Pricing
            </Link>
            <Link href="/create" className="hover:text-woo-text">
              Create
            </Link>
            <a href="mailto:hello@getwoo.com" className="hover:text-woo-text">
              Contact
            </a>
          </div>
          <p className="text-xs text-woo-muted">To woo. · Made with care</p>
        </div>
      </footer>
    </div>
  );
}
