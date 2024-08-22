import React, { createContext, useContext, useState } from "react";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
} from "../api";

// 초기 기본값 설정
const defaultAuthContext = {
  user: null,
  register: () => {},
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);

  const register = async (email, password) => {
    try {
      const response = await apiRegister(email, password);
      if (response.success) {
        setUser({ email });
        setAuthMessage("registrationSuccessful"); // 성공 메시지 설정
      } else {
        handleFailureMessage(response.message);
      }
      return response;
    } catch (error) {
      setAuthMessage("registrationFailed"); // 일반적인 실패 메시지 설정
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
      setUser(null);
      setAuthMessage("logoutSuccessful");
      return response;
    } catch (error) {
      setAuthMessage("unexpectedError");
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, authMessage, setAuthMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
