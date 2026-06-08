import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        navy: {
          900: "#0d0d1a",
          800: "#1a1a2e",
          700: "#16213e",
          600: "#0f3460",
        },
        gold: {
          300: "#f5d58a",
          400: "#e2b96f",
          500: "#c99a3e",
        },
      },
    },
  },
  plugins: [],
};

export default config;