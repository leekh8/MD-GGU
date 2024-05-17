import React, { createContext, useContext, useState } from "react";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
} from "../api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (username, email, password) => {
    try {
      const response = await apiRegister(username, email, password);
      // 회원가입 성공 후 로그인 상태 설정 (옵션)
      setUser({ username });
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error; // 오류를 다시 던져 컴포넌트에서 처리할 수 있도록 함
    }
  };

  const login = async (username, password) => {
    try {
      // API 호출을 통한 로그인 시도
      const response = await apiLogin(username, password);
      // 로그인 성공 시 사용자 정보를 상태로 설정
      setUser({ username });
      console.log("Login successful:", response);
    } catch (error) {
      // 오류 처리
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // API 호출을 통한 로그아웃 시도
      const response = await apiLogout();
      // 로그아웃 성공 시 사용자 상태를 null로 설정
      setUser(null);
      console.log("Logout successful:", response);
    } catch (error) {
      // 오류 처리
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
