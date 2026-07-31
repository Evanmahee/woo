import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Woo } from "@/lib/types";
import WooRecipientClient from "./WooRecipientClient";

export const dynamic = "force-dynamic";

export default async function WooPublicPage({
  params,
}: {
  params: { id: string };
}) {
  let woo: Woo | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("woos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      notFound();
    }
    woo = data as Woo;
  } catch {
    notFound();
  }

  return <WooRecipientClient woo={woo!} />;
}
