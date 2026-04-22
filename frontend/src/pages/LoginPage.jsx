import React, { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("allFieldsRequired"));
      return;
    }

    setIsLoading(true);
    try {
      await auth.login(email, password);
      setTimeout(() => {
        if (auth.user?.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      setError(t("incorrectEmailOrPassword"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("login")}</title>
      </Helmet>
      <div className="max-w-lg mx-auto mt-10 px-6 py-8 shadow-lg rounded-lg bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-brand-blue dark:text-white mb-6">
          {t("loginToYourAccount")}
        </h1>
        {error && (
          <p className="break-line text-red-500 text-center text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="form-label">
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">
              {t("password")}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t("loading") : t("login")}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("noAccount")}{" "}
          <Link to="/signup" className="text-brand-blue dark:text-blue-400 hover:underline font-medium">
            {t("signup")}
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
