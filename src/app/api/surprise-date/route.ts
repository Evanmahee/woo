import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBilling } from "@/lib/billing";
import { PLAN_LIMITS } from "@/lib/plans";
import {
  clientIp,
  publicError,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/security";
import { surpriseDateSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`surprise:${ip}`, 5, 60_000);
    if (!rl.ok) return rateLimitedResponse(rl.retryAfterSec);

    const raw = await req.json().catch(() => null);
    const parsed = surpriseDateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { email, preferences, budget, city } = parsed.data;
    const emailRl = rateLimit(`surprise:email:${email}`, 10, 60 * 60_000);
    if (!emailRl.ok) return rateLimitedResponse(emailRl.retryAfterSec);

    const billing = await getOrCreateBilling(email);
    if (!PLAN_LIMITS[billing.plan].surpriseDate) {
      return NextResponse.json(
        {
          error: "Surprise Date is a Woo Pro feature",
          code: "PRO_REQUIRED",
          required_tier: "woo_pro",
        },
        { status: 402 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Surprise Date is temporarily unavailable" },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = `Generate one creative, romantic, personalized date idea.
Preferences: ${(preferences || "open to anything").slice(0, 500)}
Budget: ${(budget || "moderate").slice(0, 80)}
City / area: ${(city || "local").slice(0, 80)}

Respond with JSON only:
{"title":"...","description":"...","emoji":"...","tips":["...","..."]}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const idea = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: text };

    return NextResponse.json({ idea });
  } catch (e) {
    return publicError(500, "Failed to generate", e);
  }
}
