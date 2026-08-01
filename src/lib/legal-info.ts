export const COMPANY = {
  legalName: "SUPERNOVA TECH LABS SL",
  taxId: "B88846837",
  address: "Calle Álamos 7, 29012 Málaga, España",
  email: "hello@getwoo.app",
  domain: "getwoo.app",
  productName: "Woo",
} as const;

export const LEGAL_URLS = {
  privacy: "/privacy",
  legal: "/legal",
  terms: "/terms",
  cookies: "/cookies",
} as const;

export const COOKIE_CONSENT_KEY = "woo_cookie_consent";

export type CookieConsentChoice = "all" | "necessary";
