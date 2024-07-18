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

  const register = async (username, email, password) => {
    try {
      const response = await apiRegister(username, email, password);
      setUser({ username });
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      setUser({ username });
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await apiLogout();
      setUser({ username: "Guest" });
      console.log("Logout successful:", response);
    } catch (error) {
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
