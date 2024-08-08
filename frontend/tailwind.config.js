/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": {
          DEFAULT: "#003d5b", // 기본 파랑
          light: "#17698c", // 밝은 파랑
          dark: "#002940", // 어두운 파랑
        },
        "brand-yellow": {
          DEFAULT: "#ffa600", // 기본 노랑
          light: "#ffc733", // 밝은 노랑
          dark: "#cc8500", // 어두운 노랑
        },
        "brand-red": {
          DEFAULT: "#d62828", // 기본 빨강
          light: "#e65151", // 밝은 빨강
          dark: "#a62020", // 어두운 빨강
        },
        "brand-gray": {
          DEFAULT: "#A9A9A9", // 기본 회색
          light: "#dcdcdc", // 밝은 회색
          dark: "#808080", // 어두운 회색
        },
        "neutral-gray": {
          // 배경, 테두리 등에 사용할 중립적인 회색
          light: "#f8f9fa", // 밝은 회색
          DEFAULT: "#e9ecef", // 기본 회색
          dark: "#dee2e6", // 어두운 회색
        },
        "success-green": "#28a745", // 성공, 강조 등에 사용할 녹색
        "info-blue": "#17a2b8", // 정보, 링크 등에 사용할 파랑
        "warning-yellow": "#ffc107", // 경고, 주의 등에 사용할 노랑
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
