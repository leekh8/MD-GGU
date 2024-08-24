// 메시지 표시 컴포넌트
import React, { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";

const AuthMessage = () => {
  const { authMessage, setAuthMessage } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // 메시지가 설정된 경우 3초 후에 자동으로 사라지도록 설정
    if (authMessage) {
      const timer = setTimeout(() => {
        setAuthMessage(null);
      }, 3000);
      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 해제
    }
  }, [authMessage, setAuthMessage]);

  if (!authMessage) return null; // 메시지가 없으면 아무것도 렌더링하지 않음

  // 메시지 상태에 따라 스타일을 변경
  const messageClass =
    authMessage.status === "error" ? "bg-warning-yellow" : "bg-success-green";

  return (
    <div
      className={`${messageClass} text-white px-4 py-3 rounded shadow-strong flex items-center justify-between max-w-xs fixed bottom-4 right-4`}
      role="alert"
    >
      <span className="block sm:inline">{t(authMessage.message)}</span>
      <button
        type="button"
        className="text-white ml-4"
        onClick={() => setAuthMessage(null)}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default AuthMessage;
