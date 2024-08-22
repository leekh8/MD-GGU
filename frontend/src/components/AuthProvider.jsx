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
  const [user, setUser] = useState(null); // 초기값을 null로 유지
  const [authMessage, setAuthMessage] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    // 현재 사용자의 정보를 가져오도록 초기화
    const initializeUser = async () => {
      try {
        const currentUser = await apiGetUser(); // 현재 사용자 정보 가져오기
        if (currentUser) {
          setUser(currentUser); // 가져온 사용자 정보로 설정
        } else {
          setUser({ username: "Guest" });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser({ username: "Guest" });
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    initializeUser();
  }, []);

  const register = async (email, password) => {
    try {
      const response = await apiRegister(email, password);
      if (response.success) {
        setUser({ email });
        setAuthMessage("registrationSuccessful");
      } else {
        handleFailureMessage(response.message);
      }
      return response;
    } catch (error) {
      setAuthMessage("registrationFailed");
      console.error("Registration error:", error);
      throw error;
    }
  };

  const handleFailureMessage = (message) => {
    if (message.includes("Email is already taken")) {
      setAuthMessage("emailAlreadyTaken");
    } else if (
      message.includes("network error") ||
      message.includes("server error")
    ) {
      setAuthMessage("serverOrNetworkError");
    } else {
      setAuthMessage("unexpectedError");
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      setUser({ email });
      setAuthMessage("loginSuccessful");
      return response;
    } catch (error) {
      setAuthMessage("incorrectEmailOrPassword");
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await apiLogout();
      setUser({ username: "Guest" });
      setAuthMessage("logoutSuccessful");
      return response;
    } catch (error) {
      setAuthMessage("unexpectedError");
      console.error("Logout error:", error);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때 표시
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
