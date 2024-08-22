// 메시지 표시 컴포넌트
import React, { useEffect } from "react";
import { useAuth } from "./AuthProvider";

const AuthMessage = () => {
  const { authMessage, setAuthMessage } = useAuth();

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

  return (
    <div
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span className="block sm:inline">{authMessage}</span>
    </div>
  );
};

export default AuthMessage;
