import type { Config } from "tailwindcss";

const colors = {
  primary: "#DBFC8D",
  "btn-text-primary": "#0D0D0D",
  "btn-text-secondary": "#FFFFFF",
  "btn-text-grayish": "#FFFFFF",
  "btn-text-purple": "#0D0D0D",
  white: "#FFFFFF",
  "btn-text-white": "#0D0D0D",
  black: "#1B1B1B",
  "btn-text-black": "#FFFFFF",
  "btn-border-black": "#333333",
  warning: "#ED6A5A",
  "btn-text-warning": "#0D0D0D",
  disabled: "#999999",
  "btn-text-disabled": "#666666",
  "border-white": "#E9E9E9",
  aqua: "#6DECAF",
  gray: "#999999",
  "input-gray": "#929292",
  "search-gray": "#4D4D4D",
  grayish: "#4D4D4D",
  purple: "#A3A3EC",
  "dark-purple": "#8872A5",
  pink: "#CFC5F7",
  "btn-text-pink": "#0D0D0D",
  "btn-text-pink-border": "#E3DCFF",
  "bg-pink-border": "#0D0D0D",
  red: "rgb(239 68 68)",
  "chomp-purple": "#A3A3EC",
};

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        purplePulse: {
          "0%": {
            backgroundColor: "#8872A5",
          },
          "50%": {
            backgroundColor: "#575CDF",
          },
          "100%": {
            backgroundColor: "#8872A5",
          },
        },
      },
      animation: {
        purplePulse: "purplePulse 2s infinite",
      },
      fontFamily: {
        sora: ["var(--font-sora)"],
      },
      fontSize: {
        xs: ["10px", "12.6px"],
        sm: ["13px", "16.38px"],
        base: ["16px", "20px"],
        l: ["24px", "27.6px"],
      },
      boxShadow: {
        input: "0 0 4px 0",
      },
      dropShadow: {
        "question-card": "0 -4px 4px #00000020",
      },
      backgroundImage: {
        "pink-gradient": "linear-gradient(90deg, #A3A3EC 0%, #CFC5F7 100%)",
      },
      colors: colors,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
    plugins: [],
    safelist: [
      "z-50",
      ...Object.keys(colors).map((color) => `text-${color}`),
      ...Object.keys(colors).map((color) => `bg-${color}`),
      "text-sm",
      "font-light",
      "text-white",
    ],
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
