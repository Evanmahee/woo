"use client";

import { useEffect } from "react";

type Props = {
  value: number;
  currency: string;
  transactionId: string;
  sendTo: string;
};

/**
 * Fires Google Ads conversion once per paid Stripe Checkout session.
 * Guarded by sessionStorage so refresh / re-render does not double-count.
 */
export function SuccessConversion({
  value,
  currency,
  transactionId,
  sendTo,
}: Props) {
  useEffect(() => {
    if (!sendTo || !transactionId) return;

    const key = `woo_conversion_fired_${transactionId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* private mode — still attempt once this mount */
    }

    const fire = () => {
      if (typeof window.gtag !== "function") return false;
      window.gtag("event", "conversion", {
        send_to: sendTo,
        value,
        currency,
        transaction_id: transactionId,
      });
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      return true;
    };

    if (fire()) return;

    // gtag may load slightly after hydration
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (fire() || Date.now() - started > 8000) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [value, currency, transactionId, sendTo]);

  return null;
}
