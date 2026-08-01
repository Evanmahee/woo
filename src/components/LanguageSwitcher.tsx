"use client";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSwitcher({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark" | "soft";
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  const base =
    variant === "dark"
      ? "border-white/25 bg-white/10 text-white"
      : variant === "soft"
        ? "border-black/10 bg-white/80 text-woo-text"
        : "border-black/10 bg-white text-woo-text";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${base} ${className}`}
      role="group"
      aria-label={t.common.language}
    >
      {LOCALES.map((code: Locale) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`min-h-[32px] min-w-[36px] rounded-full px-2 text-xs font-medium touch-manipulation transition ${
              active
                ? variant === "dark"
                  ? "bg-white text-woo-text"
                  : "bg-woo-accent text-white"
                : variant === "dark"
                  ? "text-white/70 hover:text-white"
                  : "text-woo-muted hover:text-woo-text"
            }`}
            aria-pressed={active}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
