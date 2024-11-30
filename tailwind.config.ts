import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const colors = {
  // OLD COLORS
  aqua: "#6DECAF",
  "input-gray": "#929292",
  "dark-purple": "#8872A5",
  pink: "#CFC5F7",

  // HARDCODED COLORS IN APP
  // #6DECAFCC
  // #FFF294
  // #DFDFDF
  // #E2956C
  // #DD7944

  // FIGMA NEW COLORS
  primary: "#5955D6",
  "primary-muted": "#2C28A4",
  secondary: "#AFADEB",
  destructive: "#ED6A5A",
  green: "#1ED3B3",
  white: "#FFFFFF",
  gray: {
    50: "#FFFFFF",
    100: "#E6E6E6",
    200: "#CCCCCC",
    300: "#B3B3B3",
    400: "#999999",
    500: "#666666",
    600: "#4D4D4D",
    700: "#333333",
    800: "#1B1B1B",
    900: "#0D0D0D",
  },
  purple: {
    50: "#EBEAFA",
    100: "#D7D6F5",
    200: "#AFADEB",
    300: "#8784E1",
    400: "#5F5BD7",
    500: "#5955D6",
    600: "#2C28A4",
    700: "#211E7B",
    800: "#161452",
    900: "#0B0A29",
  },

  chomp: {
    blue: {
      dark: "#89E0CD",
      light: "#D6FCF4",
    },
    orange: {
      dark: "#DD7944",
      light: "#F0B392",
    },
    green: {
      light: "#DBFC8D",
    },
  },
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
        loadingLine: {
          from: {
            width: "0%",
          },
          to: {
            width: "100%",
          },
        },
      },
      animation: {
        purplePulse: "purplePulse 2s infinite",
        loadingLine: "loadingLine 4s linear forwards",
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", ...defaultTheme.fontFamily.sans],
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
