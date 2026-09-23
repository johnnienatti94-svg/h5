import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-orange": "#FF6E00",
        "primary-container": "#007ACC",
        "primary-ink": "#0F172A",
        "secondary-text": "#64748B",
        "structural-border": "#E2E8F0",
        "canvas": "#F8FAFC",
        "surface": "#FFFFFF",
        "surface-container": "#EBEEF5",
        "surface-container-low": "#F1F3FB",
        "surface-container-high": "#E6E8EF",
        "surface-dim": "#D7DAE1",
        "success": "#16A365",
        "error-logout": "#DC3345",
        "primary": "#0061A3",
        "secondary": "#9F4200",
        "secondary-container": "#F86B00",
        brand: "#FF6E00",
        action: "#007ACC",
        promo: "#29BDD1",
        ink: "#0F172A",
        muted: "#64748B",
        border: "#E2E8F0",
        disabled: "#EDF2F7",
      },
      fontFamily: {
        sans: ["Outfit", "Noto Sans Thai", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      fontSize: {
        "page-title": ["26px", { lineHeight: "32px", fontWeight: "700" }],
        "section-title": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "card-title": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "financial-value": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "helper": ["11px", { lineHeight: "16px", fontWeight: "400" }],
        "bottom-nav": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      borderRadius: {
        screen: "28px",
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
};

export default config;
