import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fbfaf7",
        ink: "#171717",
        muted: "#5f5a52",
        line: "#ded8cc",
        forest: "#2f4f46"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 23, 23, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
