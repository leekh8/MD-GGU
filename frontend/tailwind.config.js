/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/styles.css",
    // 🛑 전에는 `./public/index.html` 을 보고 있었다. Vite 가 쓰는 진입
    //    HTML 은 뿌리의 `./index.html` 이고, public 쪽 파일은 CRA 시절
    //    잔재였다(지웠다). **엉뚱한 파일을 훑고 있었으니 진입 HTML 에 쓴
    //    클래스는 빌드에서 빠졌다.**
    "./index.html",
  ],
  darkMode: "class",
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
        // 🛑 `Pretendard Variable` 을 먼저 적는다. index.html 이 거는 가변 판
        //    CSS 가 그 이름으로 등록한다 (비가변 판은 `Pretendard`). 둘 다
        //    적어 두면 어느 판을 걸어도 먹는다. styles.css 의 body 선언과
        //    **같은 목록을 유지한다** - 한쪽만 고치면 `font-sans` 를 쓴
        //    자리와 body 가 다른 글꼴로 갈린다.
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "sans-serif",
        ],
        // ⚠️ `Merriweather` 와 `Inter` 는 **로드하는 곳이 없다.** 적어 둔
        //    이름이라 지금은 OS 기본 세리프로 떨어진다. 쓸 자리가 생기면
        //    그때 로드하고, 안 쓰면 목록에서 뺀다.
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
