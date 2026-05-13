/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Dark mode (Arc-inspired deep navy + teal) ──
        dark: {
          bg:       "#050d1a",
          surface:  "#091525",
          card:     "#0d1f35",
          border:   "#0e3054",
          hover:    "#112840",
        },
        // ── Light mode (clean white + teal) ──
        light: {
          bg:       "#f0f6ff",
          surface:  "#ffffff",
          card:     "#ffffff",
          border:   "#c8dff5",
          hover:    "#e4f0fd",
        },
        // ── Arc brand teal/cyan accent ──
        arc: {
          50:  "#e6fbfa",
          100: "#b3f4f0",
          200: "#66e8e0",
          300: "#1adbd0",
          400: "#00c2b8",   // primary accent
          500: "#00a89f",
          600: "#008f87",
          700: "#006f69",
          800: "#004f4b",
          900: "#002f2d",
        },
        // ── Keep indigo for secondary buttons ──
        accent:         "#00c2b8",
        "accent-hover": "#00a89f",
        success:  "#10b981",
        warning:  "#f59e0b",
        error:    "#ef4444",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        glow:    { "0%": { boxShadow: "0 0 5px #00c2b840" }, "100%": { boxShadow: "0 0 20px #00c2b880" } },
      },
    },
  },
  plugins: [],
};