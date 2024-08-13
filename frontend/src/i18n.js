import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "ko", // 초기 언어 설정 (한국어)
  fallbackLng: "en", // 지원되지 않는 언어일 경우 fallback 언어 (영어)
  debug: true, // 개발 모드에서는 디버깅 활성화
  interpolation: {
    escapeValue: false, // React에서 XSS 공격 방지를 위해 escape 처리를 하므로, 여기서는 비활성화
  },
});

export default i18n;
