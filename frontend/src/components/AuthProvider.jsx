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
  const [user, setUser] = useState({ username: "Guest" });
  const [authMessage, setAuthMessage] = useState(null);

  const register = async (email, password) => {
    try {
      const response = await apiRegister(email, password);
      if (response.success) {
        setUser({ email });
        setAuthMessage(response.message); // 서버에서 받은 성공 메시지 설정
      } else {
        setAuthMessage(response.message); // 서버에서 받은 실패 메시지 설정
      }
      return response;
    } catch (error) {
      setAuthMessage("Registration failed. Please try again later.");
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      setUser({ email });
      setAuthMessage("Login successful!");
      console.log("Login successful:", response);
    } catch (error) {
      setAuthMessage("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await apiLogout();
      setUser({ username: "Guest" });
      setAuthMessage("Logout successful!");
      console.log("Logout successful:", response);
    } catch (error) {
      setAuthMessage("Logout failed. Please try again later.");
      console.error("Logout failed:", error);
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
