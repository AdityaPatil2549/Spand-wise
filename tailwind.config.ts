import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-eb-garamond)", "serif"],
        body: ["var(--font-hanken-grotesk)", "sans-serif"],
      },
      colors: {
        // Map CSS custom properties to Tailwind classes
        surface: {
          base: "var(--surface-base)",
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
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
