export const LOCALES = ["en", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
};

export const LOCALE_STORAGE_KEY = "woo_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr" || value === "es";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("es")) return "es";
  return "en";
}
