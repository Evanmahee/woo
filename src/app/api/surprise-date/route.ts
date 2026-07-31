import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBilling } from "@/lib/billing";
import { PLAN_LIMITS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, preferences, budget, city } = body;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

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
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = `Generate one creative, romantic, personalized date idea.
Preferences: ${preferences || "open to anything"}
Budget: ${budget || "moderate"}
City / area: ${city || "local"}

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
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate" },
      { status: 500 }
    );
  }
}
