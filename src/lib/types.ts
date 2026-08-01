import type { ActivityKey } from "./activities";
import type { PlanTier } from "./plans";
import type { ThemeKey } from "./themes";

export type ActivityMode = "fixed" | "recipient_choice";
export type WooStatus = "pending" | "accepted" | "proposed_alt" | "declined";

export interface CreateDraft {
  date: string;
  time: string;
  activityMode: ActivityMode;
  plan: ActivityKey | "";
  proposedActivities: ActivityKey[];
}

export interface Woo {
  id: string;
  sender_name: string;
  sender_email: string;
  recipient_name: string;
  recipient_email: string;
  date: string;
  time: string;
  activity_mode: ActivityMode;
  plan: string | null;
  proposed_activities: string[] | null;
  chosen_activity: string | null;
  custom_message: string | null;
  theme: ThemeKey | string;
  status: WooStatus;
  proposed_alt_date: string | null;
  proposed_alt_time: string | null;
  created_at: string;
}

/** Public recipient payload — no emails. */
export type PublicWoo = Omit<Woo, "sender_email" | "recipient_email" | "recipient_name"> & {
  recipient_name?: string;
};

export interface UsersBilling {
  id: string;
  email: string;
  plan: PlanTier;
  /** @deprecated use plan === 'woo_pro' */
  is_pro: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  woos_sent_this_month: number;
  month_key: string | null;
  created_at: string;
}

export const DRAFT_STORAGE_KEY = "woo_create_draft";
