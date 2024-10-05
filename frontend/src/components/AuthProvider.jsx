import React, { createContext, useContext, useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getUser as apiGetUser,
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
    const initializeUser = async () => {
      setLoading(true);
      try {
        const currentUser = await apiGetUser(); // 서버에서 현재 사용자 정보 가져오기
        if (currentUser && currentUser.email) {
          // FIXME: DELETE
          console.log("AuthProvider - User state updated:", currentUser);

          setIsAuthenticated(true);
          setRole(currentUser.role || "USER"); // 사용자 역할 설정
        } else {
          setUser({ username: "GUEST" }); // 로그인되지 않은 경우
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
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
      // FIXME: DELETE
      console.log("AuthProvider - login called with email:", email);

      const response = await apiLogin(email, password);

      // FIXME: DELETE
      console.log("AuthProvider - Login response:", response);

      if (response.success) {
        // 쿠키에서 JWT 토큰 가져오기
        const cookies = document.cookie.split(";");
        let jwtToken = null;

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith("jwtToken=")) {
            jwtToken = cookie.substring("jwtToken=".length, cookie.length);
            break;
          }

          // FIXME: DELETE
          console.log("AuthProvider - second cookies:", cookies);
          console.log("AuthProvider - second jwtToken:", jwtToken);
        }

        // FIXME: DELETE
        console.log("AuthProvider - out of for loop cookies:", cookies);
        console.log("AuthProvider - jwtToken:", jwtToken);

        // 사용자 정보 가져오는 API 호출
        const userData = await apiGetUser(); // apiGetUser 함수가 사용자 정보를 가져오는 API를 호출
        setUser(userData);
        setIsAuthenticated(true);
        setRole(userData.role || "USER"); // 사용자 역할 설정

        setAuthMessage({ status: "success", message: "loginSuccessful" });
      } else {
        handleFailureMessage(response.message);
      }
      return response;
    } catch (error) {
      // FIXME: DELETE
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
      value={{ user, register, login, logout, authMessage, setAuthMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
