/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#003d5b",
        "brand-yellow": "#ffa600",
        "brand-red": "#d62828",
        "brand-grey": "#A9A9A9",
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      boxShadow: {
        strong:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        soft: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
