import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { publicWooView } from "@/lib/security";
import type { Woo } from "@/lib/types";
import WooRecipientClient from "./WooRecipientClient";

export const dynamic = "force-dynamic";

export default async function WooPublicPage({
  params,
}: {
  params: { id: string };
}) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      params.id
    )
  ) {
    notFound();
  }

  let woo: ReturnType<typeof publicWooView> | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("woos")
      .select(
        "id, sender_name, date, time, activity_mode, plan, proposed_activities, chosen_activity, custom_message, theme, status, proposed_alt_date, proposed_alt_time, created_at"
      )
      .eq("id", params.id)
      .single();

    if (error || !data) {
      notFound();
    }
    woo = publicWooView(data as Record<string, unknown>);
  } catch {
    notFound();
  }

  return <WooRecipientClient woo={woo as unknown as Woo} />;
}
