import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2.5rem" },
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        mist: "#EEF3F7",
        ink: { DEFAULT: "#18202A", soft: "#4A5563", mute: "#7A8594" },
        brand: { DEFAULT: "#246BFD", dark: "#1A55D6" },
        violet: "#8D5CFF",
        teal: "#20C7B7",
        line: "rgba(24, 32, 42, 0.08)",
      },
      fontFamily: {
        sans: ["Onest", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 50px -24px rgba(30, 60, 110, 0.25)",
        button: "0 10px 24px -10px rgba(36, 107, 253, 0.65)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 40s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
