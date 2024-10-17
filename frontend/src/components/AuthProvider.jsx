import React, { createContext, useContext, useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getUser as apiGetUser,
  getCookie,
} from "../api";
import "../styles.css";

// 초기 기본값 설정
const defaultAuthContext = {
  user: { username: "GUEST" },
  register: () => {},
  login: () => {},
  logout: () => {},
  authMessage: null,
  setAuthMessage: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: "GUEST" }); // 초기값을 GUEST로 설정
  const [authMessage, setAuthMessage] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const { setIsAuthenticated, setRole } = useAuthStore();

  useEffect(() => {
    const initializeUser = async (jwtToken = null) => {
      setLoading(true);
      try {
        const config = jwtToken
          ? { headers: { Authorization: `Bearer ${jwtToken}` } }
          : {};
        const currentUser = await apiGetUser(config); // 서버에서 현재 사용자 정보 가져오기 위해 apiGetUser 호출 시 config 전달
        setUser(currentUser);
        setIsAuthenticated(true);
        setRole(currentUser.role || "USER");
      } catch (error) {
        console.error("AuthProvider - Failed to fetch user data:", error);
        setUser({ username: "GUEST" }); // 오류가 발생하면 게스트로 설정
      } finally {
        setLoading(false); // 로딩 완료
      }
    };
    initializeUser();
  }, []);

  const handleFailureMessage = (message) => {
    if (message.includes("Email is already taken")) {
      setAuthMessage({ status: "error", message: "emailAlreadyTaken" });
    } else if (
      message.includes("network error") ||
      message.includes("server error")
    ) {
      setAuthMessage({ status: "error", message: "serverOrNetworkError" });
    } else {
      setAuthMessage({ status: "error", message: "unexpectedError" });
    }
  };

  const register = async (email, password) => {
    try {
      const response = await apiRegister(email, password);

      if (response.success) {
        setUser(response.data); // 서버에서 받은 사용자 정보 전체를 설정
        setAuthMessage({
          status: "success",
          message: "registrationSuccessful",
        });
      } else {
        handleFailureMessage(response.message);
      }
      return response;
    } catch (error) {
      setAuthMessage({ status: "error", message: "registrationFailed" });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      if (response.success) {
        const { accessToken } = response.data; // 응답 본문에서 Access Token 추출
        localStorage.setItem("accessToken", accessToken); // localStorage에 Access Token 저장

        // 쿠키에서 Refresh Token 가져오기
        const refreshToken = getCookie("refreshToken");

        // 응답 헤더에서 CSRF Token 가져오기
        const csrfToken = response.headers
          ? response.headers["X-Csrf-Token"]
          : undefined; // response.headers가 undefined인 경우 처리

        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("csrfToken", csrfToken);

        initializeUser(accessToken); // Access Token으로 사용자 정보 초기화
        setAuthMessage({ status: "success", message: "loginSuccessful" });
      } else {
        handleFailureMessage(response.message);
      }
      return response; // then 메서드에서 response 반환
    } catch (error) {
      console.error("AuthProvider - Login error:", error);
      setAuthMessage({ status: "error", message: "incorrectEmailOrPassword" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser({ username: "Guest" });
      setIsAuthenticated(false); // 인증 상태 업데이트
      setAuthMessage({ status: "success", message: "logoutSuccessful" });
    } catch (error) {
      setAuthMessage({ status: "error", message: "unexpectedError" });
      throw error;
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const response = await apiUpdateUser(updatedUser); // api.js에 있는 apiUpdateUser 함수 호출
      setUser(response.data); // 업데이트된 사용자 정보로 user 상태 업데이트
    } catch (error) {
      // 업데이트 실패 시 에러 처리
      console.error("AuthProvider - Failed to update user data:", error);
      throw new Error(error.message || "Failed to update profile"); // 에러 메시지 전달
    }
  };

  useEffect(() => {
    if (loading) {
      setStartTime(Date.now()); // 로딩 시작 시간 기록

      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const estimatedTotalTime = 3000; // 예상되는 총 로딩 시간 (ms) - 필요에 따라 조정
        const newProgress = Math.min(
          100,
          (elapsedTime / estimatedTotalTime) * 100
        );
        setProgress(newProgress);
      }, 100); // 100ms마다 progress 업데이트

      return () => clearInterval(timer); // 컴포넌트가 언마운트될 때 타이머 정리
    } else {
      setProgress(100); // 로딩 완료 시 progress 100으로 설정
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        authMessage,
        setAuthMessage,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
