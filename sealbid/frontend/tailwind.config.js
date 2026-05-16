/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg:      "#050d1a",
          surface: "#091525",
          card:    "#0d1f35",
          border:  "#0e3054",
          hover:   "#112840",
        },
        light: {
          bg:      "#f0f6ff",
          surface: "#ffffff",
          card:    "#ffffff",
          border:  "#c8dff5",
          hover:   "#e4f0fd",
        },
        arc: {
          50:  "#e6fbfa",
          100: "#b3f4f0",
          200: "#66e8e0",
          300: "#1adbd0",
          400: "#00c2b8",
          500: "#00a89f",
          600: "#008f87",
          700: "#006f69",
          800: "#004f4b",
          900: "#002f2d",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error:   "#ef4444",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in":   "fadeIn 0.3s ease-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "pulse-slow":"pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        // Scrolling ticker — duplicated content so it loops seamlessly
        "ticker":    "ticker 35s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        ticker:  { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};
