import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── BRAND COLORS ──────────────────────────────
      // These are the official LuxeNailsParlour colors
      // from 02_Branding_Style_Guide.md
      colors: {
        cream: "#FDFBF7",       // Primary background
        espresso: "#2D2424",    // Primary text & dark buttons
        gold: "#C5A358",        // Accent - buttons, highlights
        sand: "#E5E0D8",        // Borders, dividers, input fields
        rose: "#D4A09A",        // Hover states, decorative accents
        terracotta: "#C47B5A",  // Secondary highlights
      },

      // ── FONTS ─────────────────────────────────────
      // Cormorant Garamond = headings (elegant, serif)
      // Jost = body & UI (clean, modern)
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["Jost", "sans-serif"],
      },

      // ── BORDER RADIUS ─────────────────────────────
      borderRadius: {
        card: "12px",   // Used on service cards & artist cards
      },

      // ── BOX SHADOW ────────────────────────────────
      boxShadow: {
        card: "0 4px 24px rgba(45, 36, 36, 0.08)",   // Soft card shadow
        nav: "0 4px 30px rgba(45, 36, 36, 0.08)",    // Navbar scroll shadow
      },
    },
  },
  plugins: [],
};

export default config;