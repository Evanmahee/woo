export const THEMES = [
  {
    key: "default",
    label: "Blush Soft",
    preview: "linear-gradient(135deg, #EAE0F8 0%, #F7EAE2 55%, #FCEFD9 100%)",
    pageBg: "linear-gradient(135deg, #EAE0F8 0%, #F7EAE2 55%, #FCEFD9 100%)",
    cardBg: "#FFFFFF",
    accent: "#E85D75",
  },
  {
    key: "midnight",
    label: "Midnight Rose",
    preview: "linear-gradient(135deg, #2D1B2E 0%, #4A2545 50%, #E85D75 100%)",
    pageBg: "linear-gradient(160deg, #1A0F1C 0%, #3D1F2B 45%, #5C2A3A 100%)",
    cardBg: "rgba(255,255,255,0.95)",
    accent: "#E85D75",
  },
  {
    key: "golden",
    label: "Golden Hour",
    preview: "linear-gradient(135deg, #FCEFD9 0%, #F7D9B8 50%, #F5C6AA 100%)",
    pageBg: "linear-gradient(135deg, #FFF6E8 0%, #FCE0C0 50%, #F5C6AA 100%)",
    cardBg: "#FFFFFF",
    accent: "#C45C3E",
  },
  {
    key: "lavender",
    label: "Lavender Dream",
    preview: "linear-gradient(135deg, #D4C4F0 0%, #E8D5F5 50%, #F5E6FF 100%)",
    pageBg: "linear-gradient(135deg, #C9B8E8 0%, #E8D5F5 55%, #FDF4FF 100%)",
    cardBg: "#FFFFFF",
    accent: "#8B6BB5",
  },
  {
    key: "ocean",
    label: "Ocean Mist",
    preview: "linear-gradient(135deg, #B8D4E8 0%, #D4E8F0 50%, #E8F4F8 100%)",
    pageBg: "linear-gradient(135deg, #A8C8DC 0%, #D4E8F0 55%, #F0F8FA 100%)",
    cardBg: "#FFFFFF",
    accent: "#4A8BA8",
  },
  {
    key: "cherry",
    label: "Cherry Blossom",
    preview: "linear-gradient(135deg, #FFD6E0 0%, #FFE4EC 50%, #FFF0F5 100%)",
    pageBg: "linear-gradient(135deg, #FFC0D0 0%, #FFE4EC 55%, #FFF8FA 100%)",
    cardBg: "#FFFFFF",
    accent: "#E85D75",
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export function getTheme(key: string | null | undefined) {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

export function getThemeIndex(key: string | null | undefined): number {
  const idx = THEMES.findIndex((t) => t.key === key);
  return idx >= 0 ? idx : 0;
}
