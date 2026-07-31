import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        woo: {
          text: "#3D1F2B",
          muted: "#8A7A85",
          accent: "#E85D75",
          "accent-soft": "#F7DCE3",
          surface: "#FFFFFF",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        woo: "24px",
      },
      boxShadow: {
        woo: "0 20px 40px -12px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "woo-gradient":
          "linear-gradient(135deg, #EAE0F8 0%, #F7EAE2 55%, #FCEFD9 100%)",
        "woo-badge": "linear-gradient(135deg, #F7DCE3 0%, #FCE4EC 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
