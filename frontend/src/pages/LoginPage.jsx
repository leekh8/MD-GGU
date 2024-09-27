import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import axios from "axios";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 에러 메시지 상태
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // 제출 시 기존 에러 메시지 초기화

    if (!email || !password) {
      setError(t("allFieldsRequired"));
      return;
    }

    try {
      const response = await auth.login(email, password);

      // FIXME: DELETE
      console.log("response: ", response);

      if (response.status === 200) {
        // 로그인 성공
        navigate("/"); // 로그인 후 홈으로 리다이렉트
      } else {
        // 로그인 실패
        const errorData = response.data; // 서버 응답 데이터

        if (errorData && errorData.error) {
          // 서버에서 전달된 에러 메시지 사용
          setError(errorData.error);
        } else {
          // 예상치 못한 에러 처리
          setError(t("unexpectedError"));
        }
      }
    } catch (error) {
      if (error.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 에러)
        const { status } = error.response;
        if (status === 401) {
          // 인증 실패
          setError(t("incorrectEmailOrPassword"));
        } else {
          setError(t("serverOrNetworkError"));
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러)
        setError(t("serverOrNetworkError"));
      } else {
        // 요청 생성 중 에러 발생
        setError(t("unexpectedError"));
      }
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
        {t("loginToYourAccount")}
      </h1>
      {error && <p className="break-line text-red-500 text-center">{error}</p>}{" "}
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
