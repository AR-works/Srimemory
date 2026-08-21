import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bday: {
          purple: {
            50: "#FAF5FF",
            100: "#F3E8FF",
            200: "#E9D5FF",
            300: "#D8B4FE",
            400: "#C084FC",
            500: "#A855F7",
            600: "#9333EA",
            700: "#7E22CE",
            800: "#6B21A8",
            900: "#581C87",
            950: "#3B0764",
          },
          plum: "#2E1065",
          lavender: "#EDE9FE",
          softpink: "#FDF2F8",
          warmcream: "#FAF8F5",
          paper: "#FFFCF9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        "soft-sm": "0 2px 8px -2px rgba(126, 34, 206, 0.08)",
        "soft-md": "0 8px 24px -4px rgba(126, 34, 206, 0.12)",
        "soft-lg": "0 16px 36px -6px rgba(126, 34, 206, 0.18)",
        "glow-purple": "0 0 25px 2px rgba(168, 85, 247, 0.35)",
        "paper": "0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0,0,0,0.03)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 2s infinite",
        "pulse-gentle": "pulseGentle 3s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
