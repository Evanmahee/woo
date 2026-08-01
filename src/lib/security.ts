import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/** Escape user content before embedding in HTML emails. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function signingSecret(): string {
  const secret =
    process.env.WOO_SIGNING_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing WOO_SIGNING_SECRET (or Stripe/Supabase secret)");
  }
  return secret;
}

export function signPayload(
  purpose: string,
  payload: Record<string, string>,
  ttlSeconds = 3600
): string {
  const exp = String(Math.floor(Date.now() / 1000) + ttlSeconds);
  const body = { ...payload, purpose, exp };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySignedPayload(
  purpose: string,
  token: string
): Record<string, string> | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", signingSecret()).update(data).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Record<
      string,
      string
    >;
    if (parsed.purpose !== purpose) return null;
    if (!parsed.exp || Number(parsed.exp) < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Simple in-memory rate limit (per serverless isolate). Good enough for MVP. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return {
    ok: true,
    remaining: limit - current.count,
    retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimitedResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}

/** Never leak raw Error.message / DB errors to clients. */
export function publicError(
  status: number,
  clientMessage: string,
  logContext?: unknown
) {
  if (logContext !== undefined) {
    console.error("[api]", clientMessage, sanitizeLog(logContext));
  }
  return NextResponse.json({ error: clientMessage }, { status });
}

export function sanitizeLog(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    return value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
      .replace(/sk_(live|test)_[A-Za-z0-9]+/g, "[stripe_key]")
      .replace(/whsec_[A-Za-z0-9]+/g, "[webhook_secret]");
  }
  if (value instanceof Error) {
    return { name: value.name, message: sanitizeLog(value.message) };
  }
  if (typeof value === "object") {
    try {
      return JSON.parse(
        JSON.stringify(value, (_k, v) =>
          typeof v === "string" ? sanitizeLog(v) : v
        )
      );
    } catch {
      return "[unserializable]";
    }
  }
  return value;
}

/** Fields safe to expose on the public recipient page / respond API. */
export function publicWooView<T extends Record<string, unknown>>(woo: T) {
  const {
    id,
    sender_name,
    date,
    time,
    activity_mode,
    plan,
    proposed_activities,
    chosen_activity,
    custom_message,
    theme,
    status,
    proposed_alt_date,
    proposed_alt_time,
    created_at,
  } = woo as Record<string, unknown>;
  return {
    id,
    sender_name,
    date,
    time,
    activity_mode,
    plan,
    proposed_activities,
    chosen_activity,
    custom_message,
    theme,
    status,
    proposed_alt_date,
    proposed_alt_time,
    created_at,
  };
}
