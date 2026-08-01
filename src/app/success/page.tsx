import Stripe from "stripe";
import { tierFromStripePriceId, type PaidTier } from "@/lib/plans";
import SuccessClient from "./success-client";
import { SuccessConversion } from "./success-conversion";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

type ConversionData = {
  value: number;
  currency: string;
  transactionId: string;
  tier?: PaidTier;
};

async function verifyPaidSession(
  sessionId: string | undefined
): Promise<ConversionData | null> {
  if (!sessionId || !sessionId.startsWith("cs_")) return null;

  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    // Only count real paid checkouts (not bare /success visits)
    const paid =
      session.payment_status === "paid" ||
      (session.mode === "subscription" &&
        session.status === "complete" &&
        session.payment_status !== "unpaid");

    if (!paid || session.status !== "complete") return null;

    let tier: PaidTier | undefined;
    const meta = session.metadata?.product;
    if (meta === "woo_plus" || meta === "woo_pro") {
      tier = meta;
    } else {
      const priceId = session.line_items?.data?.[0]?.price?.id;
      const fromPrice = tierFromStripePriceId(priceId);
      if (fromPrice === "woo_plus" || fromPrice === "woo_pro") {
        tier = fromPrice;
      }
    }

    return {
      value: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "eur").toUpperCase(),
      transactionId: session.id,
      tier,
    };
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; upgraded?: string; tier?: string };
}) {
  const conversionData = await verifyPaidSession(searchParams.session_id);

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  const sendTo =
    adsId && label ? `${adsId}/${label}` : "";

  return (
    <>
      <SuccessClient
        verifiedPaid={Boolean(conversionData)}
        verifiedTier={conversionData?.tier}
      />
      {conversionData && sendTo && (
        <SuccessConversion
          value={conversionData.value}
          currency={conversionData.currency}
          transactionId={conversionData.transactionId}
          sendTo={sendTo}
        />
      )}
    </>
  );
}
