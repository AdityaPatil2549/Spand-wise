import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', ':is(.dark, .ocean, .forest, .cyberpunk)'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-eb-garamond)", "serif"],
        body: ["var(--font-hanken-grotesk)", "sans-serif"],
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
        "3xl": "1.5rem",
        "4xl": "2rem",
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
