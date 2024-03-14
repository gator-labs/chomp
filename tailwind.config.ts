import type { Config } from "tailwindcss";

const colors = {
  primary: "#DBFC8D",
  "btn-text-primary": "#0D0D0D",
  "btn-text-secondary": "#FFFFFF",
  white: "#FFFFFF",
  "btn-text-white": "#0D0D0D",
  black: "#1B1B1B",
  "btn-text-black": "#FFFFFF",
  "btn-border-black": "#333333",
  warning: "#ED6A5A",
  "btn-text-warning": "#0D0D0D",
  disabled: "#EDEDED",
  "btn-text-disabled": "#999999",
};

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)"],
      },
    },
    colors: colors,
  },
  plugins: [],
  safelist: [
    ...Object.keys(colors).map((color) => `text-${color}`),
    ...Object.keys(colors).map((color) => `bg-${color}`),
  ],
} satisfies Config;
