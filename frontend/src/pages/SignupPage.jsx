import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { HelmetProvider, Helmet } from "react-helmet-async";

const SignupPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("allFieldsRequired"));
      return;
    }

    try {
      await auth.register(email, password); // Firebase 회원 가입
      auth.setAuthMessage({
        status: "success",
        message: t("registrationSuccessful"),
      });
      navigate("/"); // 회원 가입 후 홈으로 리다이렉트
    } catch (e) {
      console.error("SignupPage - Registration error:", e);
      setError(t("emailAlreadyTaken")); // 이메일이 중복되었을 때 기본 메시지
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 py-8 shadow-lg rounded-lg">
      <HelmetProvider>
        <Helmet>
          <title>
            {t("mdggu")} ・ {t("signup")}
          </title>
        </Helmet>
      </HelmetProvider>
      <h1 className="text-xl font-semibold text-center text-brand-blue">
        {t("sign up for mdggu")}
      </h1>
      {error && <p className="break-line text-red-500 text-center">{error}</p>}
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
          {t("signup")}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
