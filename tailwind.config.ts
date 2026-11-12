import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: [
    'class',
    ':is(.dark, .savile-rebel, .dune-terminal, .cyber-velocity, .bio-alchemical, .solaris, .aurora, .ocean, .forest, .cyberpunk, .oled-pro, .neon-sunset, .graphite)',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--theme-font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--theme-font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--theme-font-sans)', 'system-ui', 'sans-serif'],
        headline: ['var(--theme-font-display)', 'system-ui', 'sans-serif'],
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
          "on-accent": "rgb(var(--theme-on-accent) / <alpha-value>)",
          "on-primary": "rgb(var(--theme-on-primary) / <alpha-value>)",
          positive: "rgb(var(--theme-positive) / <alpha-value>)",
          "positive-light": "rgb(var(--theme-positive-light) / <alpha-value>)",
          warning: "rgb(var(--theme-warning) / <alpha-value>)",
          "warning-light": "rgb(var(--theme-warning-light) / <alpha-value>)",
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
        fab: "0 10px 24px -4px rgb(var(--theme-accent) / 0.36)",
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
