import React, { createContext, useContext, useState, useEffect } from "react";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getUser as apiGetUser,
} from "../api";

// 초기 기본값 설정
const defaultAuthContext = {
  user: { username: "Guest" },
  register: () => {},
  login: () => {},
  logout: () => {},
  authMessage: null,
  setAuthMessage: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: "Guest" }); // 초기값을 Guest로 설정
  const [authMessage, setAuthMessage] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await apiGetUser(); // 서버에서 현재 사용자 정보 가져오기
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser({ username: "Guest" }); // 로그인되지 않은 경우
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser({ username: "Guest" }); // 오류가 발생하면 게스트로 설정
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
        setUser({ email });
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
        setUser({ email });
        setAuthMessage({ status: "success", message: "loginSuccessful" });
      } else {
        handleFailureMessage(response.message);
      }
      return response;
    } catch (error) {
      setAuthMessage({ status: "error", message: "incorrectEmailOrPassword" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser({ username: "Guest" });
      setAuthMessage({ status: "success", message: "logoutSuccessful" });
    } catch (error) {
      setAuthMessage({ status: "error", message: "unexpectedError" });
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
