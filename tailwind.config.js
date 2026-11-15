/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    // Teal + Dodger Blue on white Brainlink theme. The public site's CSS
    // variables (src/index.css) mirror it. No gradients anywhere.
    themes: [
      {
        brainlink: {
          primary: "#0F766E",
          "primary-content": "#FFFFFF",
          secondary: "#1E90FF",
          "secondary-content": "#FFFFFF",
          accent: "#14B8A6",
          "accent-content": "#042F2E",
          neutral: "#0F2A2E",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#F3F9F8",
          "base-300": "#DCE9E7",
          "base-content": "#0F2A2E",
          info: "#0E7490",
          success: "#15803D",
          warning: "#B45309",
          error: "#DC2626",
          "--rounded-box": "0.875rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "999px",
          "--animation-btn": "0.15s",
          "--btn-focus-scale": "0.98",
          "--border-btn": "1px",
        },
      },
    ],
    darkTheme: false,
    // Studio has its own styling; don't let daisyUI paint the root element.
    base: false,
    logs: false,
  },
}
