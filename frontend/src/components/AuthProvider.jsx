import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUser,
  apiUpdateUser,
} from "../api";
import "../styles.css";

const defaultAuthContext = {
  user: null,
  loading: true,
  register: () => {},
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  authMessage: null,
  setAuthMessage: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);

  // 앱 시작 시 localStorage 토큰으로 세션 복원
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getUser();
        setUser(userData);
      } catch {
        // 토큰 만료 or 서버 오류 → 로그아웃 상태로
        localStorage.removeItem("accessToken");
        localStorage.removeItem("csrfToken");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { accessToken, csrfToken } = await apiLogin(email, password);
      localStorage.setItem("accessToken", accessToken);
      if (csrfToken) localStorage.setItem("csrfToken", csrfToken);

      const userData = await getUser();
      setUser(userData);
      setAuthMessage({ status: "success", message: "loginSuccessful" });
    } catch (error) {
      setAuthMessage({ status: "error", message: "incorrectEmailOrPassword" });
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      await apiRegister(email, password);
      // 가입 후 자동 로그인
      await login(email, password);
      setAuthMessage({ status: "success", message: "registrationSuccessful" });
    } catch (error) {
      setAuthMessage({ status: "error", message: error.message || "unexpectedError" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // 서버 오류여도 클라이언트 세션은 무조건 초기화
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("csrfToken");
      setUser(null);
      setAuthMessage({ status: "success", message: "logoutSuccessful" });
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const data = await apiUpdateUser(updatedUser);
      setUser((prev) => ({ ...prev, ...data }));
      setAuthMessage({ status: "success", message: "profileUpdated" });
      return data;
    } catch (error) {
      setAuthMessage({ status: "error", message: error.message || "unexpectedError" });
      throw error;
    }
  };

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
      value={{ user, register, login, logout, updateUser, authMessage, setAuthMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
