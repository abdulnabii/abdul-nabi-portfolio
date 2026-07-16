/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          border: "rgba(255, 255, 255, 0.12)",
          surface: "rgba(255, 255, 255, 0.06)",
          elevated: "rgba(255, 255, 255, 0.1)",
        },
        accent: {
          DEFAULT: "#818cf8",
          soft: "#a5b4fc",
          glow: "#6366f1",
          cyan: "#22d3ee",
          violet: "#a78bfa",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.35), transparent)",
        "grid-fade":
          "linear-gradient(to bottom, transparent, rgba(5, 8, 20, 0.9))",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-lg":
          "0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
        glow: "0 0 40px rgba(99, 102, 241, 0.25)",
        "glow-sm": "0 0 20px rgba(99, 102, 241, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.85" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
