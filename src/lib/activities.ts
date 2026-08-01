import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const ACTIVITIES = [
  { key: "arcade", label: "Arcade Night", emoji: "🕹️" },
  { key: "coffee", label: "Cozy Coffee", emoji: "☕" },
  { key: "sunset", label: "Sunset Walk", emoji: "🌅" },
  { key: "dinner", label: "Dinner Date", emoji: "🍽️" },
  { key: "movie", label: "Movie Night", emoji: "🎬" },
  { key: "mini_golf", label: "Mini Golf", emoji: "⛳" },
  { key: "bookstore", label: "Bookstore Wander", emoji: "📚" },
  { key: "fast_food", label: "Fast Food Run", emoji: "🍔" },
  { key: "picnic", label: "Picnic", emoji: "🧺" },
  { key: "ice_cream", label: "Ice Cream Date", emoji: "🍦" },
  { key: "beach", label: "Beach Day", emoji: "🏖️" },
  { key: "karaoke", label: "Karaoke Night", emoji: "🎤" },
  { key: "cooking", label: "Cook Together", emoji: "🍳" },
  { key: "surprise", label: "Surprise Date", emoji: "🎁", premium: true },
] as const;

export type ActivityKey = (typeof ACTIVITIES)[number]["key"];

export type Activity = (typeof ACTIVITIES)[number];

export function getActivity(key: string | null | undefined): Activity | undefined {
  if (!key) return undefined;
  return ACTIVITIES.find((a) => a.key === key);
}

export function activityLabel(
  key: string | null | undefined,
  locale: Locale = "en"
): string {
  const activity = getActivity(key);
  const dict = getDictionary(locale).activities;
  if (!activity) return dict.aDate;
  return dict[activity.key] || activity.label;
}

export function formatActivityLabel(
  key: string | null | undefined,
  locale: Locale = "en"
): string {
  const activity = getActivity(key);
  if (!activity) return getDictionary(locale).activities.aDate;
  return `${activityLabel(key, locale)} ${activity.emoji}`;
}
