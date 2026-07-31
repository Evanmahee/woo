import { NextRequest, NextResponse } from "next/server";
import { sendWooInvitation } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Woo } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: woo, error } = await supabase
      .from("woos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !woo) {
      return NextResponse.json({ error: "Woo not found" }, { status: 404 });
    }

    await sendWooInvitation(woo as Woo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
