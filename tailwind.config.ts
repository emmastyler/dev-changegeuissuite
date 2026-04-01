import type { Config } from "tailwindcss";
export default {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        navy: "#0a2540",
        "navy-mid": "#0d3060",
        blue: { DEFAULT: "#1a6bfa", dark: "#1557d4", light: "#e8f0fe", tint: "#f0f4ff" },
        sage: "#edf1f7",
        "cg-border": "#e2e8f0",
        "text-1": "#0a2540", "text-2": "#334155", "text-3": "#64748b", "text-4": "#94a3b8",
        "cg-off": "#f8f9fc",
      },
      borderRadius: { cg: "16px" },
    },
  },
  plugins: [],
} satisfies Config;
