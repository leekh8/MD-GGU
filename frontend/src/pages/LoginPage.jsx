import React, { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import AuthMessage from "../components/AuthMessage";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 에러 메시지 상태
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    try {
      await auth.login(email, password);
      navigate("/"); // Redirect to home after login
    } catch (e) {
      setError("Login failed: " + e.message); // 예외 처리와 에러 메시지 설정
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 py-8 shadow-lg rounded-lg">
      <Helmet>
        <title>
          {t("mdggu")} ・ {t("login")}
        </title>
      </Helmet>
      <h1 className="text-xl font-semibold text-center text-brand-blue">
        {t("login to your account")}
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}{" "}
      {/* 에러 메시지 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t("email")}
          </label>
          <input
            type="email"
            id="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            {t("password")}
          </label>
          <input
            type="password"
            id="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        >
          {t("login")}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
