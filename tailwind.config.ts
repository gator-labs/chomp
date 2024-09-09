import type { Config } from "tailwindcss";

const colors = {
  // OLD COLORS
  aqua: "#6DECAF",
  "input-gray": "#929292",
  "dark-purple": "#8872A5",
  pink: "#CFC5F7",

  // HARDCODED COLORS IN APP
  // #6DECAFCC
  // #8C96ED
  // #575CDF
  // #FFF294§
  // #DFDFDF
  // #E2956C
  // #171616
  // #DD7944

  // FIGMA NEW COLORS
  primary: "#A3A3EC",
  "primary-muted": "#2C28A4",
  destructive: "#ED6A5A",
  green: "#1ED3B3",
  red: "#ED6A5A",
  white: "#FFFFFF",
  gray: {
    50: "#F1F1F1",
    100: "#E6E6E6",
    200: "#CCCCCC",
    300: "#B3B3B3",
    400: "#999999",
    600: "#666666",
    700: "#4D4D4D",
    800: "#333333",
    850: "#1B1B1B",
    950: "#0D0D0D",
  },
  purple: {
    50: "#EBEAFA",
    100: "#D7D6F5",
    200: "#AFADEB",
    300: "#8784E1",
    400: "#5F5BD7",
    500: "#A3A3EC",
    600: "#2C28A4",
    700: "#211E7B",
    800: "#161452",
    900: "#0B0A29",
  },
  indigo: "#5955D6",
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
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
