import type { Config } from "tailwindcss";

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      inter: ["var(--inter)"],
    },
  },
  plugins: [],
} satisfies Config;
