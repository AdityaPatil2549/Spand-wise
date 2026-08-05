import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', ':is(.dark, .ocean, .forest, .cyberpunk, .neo-kinpaku-pro)'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-albert)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-alumni)", "sans-serif"],
        body: ["var(--font-albert)", "sans-serif"],
        mono: ["SFMono-Regular", "Roboto Mono", "Consolas", "monospace"],
      },
      colors: {
        theme: {
          base: "rgb(var(--theme-base) / <alpha-value>)",
          surface: "rgb(var(--theme-surface) / <alpha-value>)",
          "surface-hover": "rgb(var(--theme-surface-hover) / <alpha-value>)",
          elevated: "rgb(var(--theme-elevated) / <alpha-value>)",
          "elevated-hover": "rgb(var(--theme-elevated-hover) / <alpha-value>)",
          border: "rgb(var(--theme-border) / <alpha-value>)",
          primary: "rgb(var(--theme-primary) / <alpha-value>)",
          secondary: "rgb(var(--theme-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--theme-tertiary) / <alpha-value>)",
          accent: "rgb(var(--theme-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--theme-accent-hover) / <alpha-value>)",
          "accent-light": "rgb(var(--theme-accent-light) / <alpha-value>)",
          danger: "rgb(var(--theme-danger) / <alpha-value>)",
          "danger-light": "rgb(var(--theme-danger-light) / <alpha-value>)",
          white: "rgb(var(--theme-white) / <alpha-value>)",
          inverse: "rgb(var(--theme-inverse) / <alpha-value>)",
        },
      },
      borderRadius: {
        none: "0",
        xs: "2px",
        code: "3px",
        sm: "4px",
        "control-sm": "5px",
        md: "6px",
        "control-md": "7px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "14px",
        "4xl": "16px",
        pill: "999px",
      },
      boxShadow: {
        fab: "0 8px 16px -4px rgba(139, 92, 246, 0.45)",
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
