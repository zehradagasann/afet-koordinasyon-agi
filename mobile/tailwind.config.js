/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E63946",
          50: "#FFF5F6",
          100: "#FEE2E5",
          200: "#FCBFC5",
          300: "#F88E97",
          400: "#F35865",
          500: "#E63946",
          600: "#C5202D",
          700: "#9E1924",
          800: "#76131B",
          900: "#4F0D12",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
        },
        background: "#FFFFFF",
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#F9FAFB",
          muted: "#F3F4F6",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4B5563",
          muted: "#9CA3AF",
          inverse: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        status: {
          active: "#10B981",
          pending: "#F59E0B",
          urgent: "#DC2626",
          resolved: "#3B82F6",
          info: "#0EA5E9",
        },
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        button: "24px",
        modal: "20px",
      },
      fontSize: {
        "title-xl": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "title-lg": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "title-md": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
      spacing: {
        "safe-top": "44px",
        "safe-bottom": "34px",
      },
    },
  },
  plugins: [],
};
