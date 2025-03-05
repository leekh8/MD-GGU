import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebaseConfig";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "../styles.css";

// 초기 기본값 설정
const defaultAuthContext = {
  user: null,
  register: () => {},
  login: () => {},
  logout: () => {},
  authMessage: null,
  setAuthMessage: () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase 인증 상태 변화 감지 (자동 로그인/로그아웃 반영)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateNickname = async (seedText) => {
    try {
      const apiUrl = process.env.VITE_PYTHON_API_URL;
      const response = await fetch(
        `${apiUrl}/generate_nickname?method=markov_chain`
      );

      const data = await response.json();
      if (data.nickname) {
        return data.nickname;
      } else {
        throw new Error(data.error || "Nickname generation failed");
      }
    } catch (error) {
      console.error("Failed to generate nickname:", error);
      return "default_nickname"; // 기본 닉네임
    }
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const seedText = email.split("@")[0]; // 이메일 앞부분을 seed로 사용
      const nickname = await generateNickname(seedText); // Flask API 호출로 닉네임 생성
      setUser(userCredential.user);
      setAuthMessage({ status: "success", message: "registrationSuccessful" });
    } catch (error) {
      console.error("AuthProvider - Register error:", error);
      setAuthMessage({ status: "error", message: error.message });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      setAuthMessage({ status: "success", message: "loginSuccessful" });
    } catch (error) {
      console.error("AuthProvider - Login error:", error);
      setAuthMessage({ status: "error", message: "incorrectEmailOrPassword" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthMessage({ status: "success", message: "logoutSuccessful" });
    } catch (error) {
      console.error("AuthProvider - Logout error:", error);
      setAuthMessage({ status: "error", message: "unexpectedError" });
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
      value={{ user, register, login, logout, authMessage, setAuthMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
