import React, { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const { t }    = useTranslation();
  const auth     = useAuth();
  const navigate = useNavigate();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [errors,    setErrors]    = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [loading,   setLoading]   = useState(false);

  // 필드별 실시간 검증
  const validateField = (name, value) => {
    if (name === "email") {
      if (!value)            return t("fieldRequired");
      if (!EMAIL_RE.test(value)) return t("invalidEmail");
    }
    if (name === "password") {
      if (!value) return t("fieldRequired");
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");

    const newErrors = {
      email:    validateField("email",    email),
      password: validateField("password", password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await auth.login(email, password);
      setTimeout(() => navigate(auth.user?.role === "ADMIN" ? "/admin" : "/"), 300);
    } catch {
      setSubmitErr(t("incorrectEmailOrPassword"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("login")}</title>
      </Helmet>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-8 border border-gray-100 dark:border-gray-800">

          <h1 className="text-2xl font-bold text-center text-brand-blue dark:text-white mb-1">
            {t("mdggu")}
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-7">
            {t("loginToYourAccount")}
          </p>

          {submitErr && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {submitErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="form-label">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
                className={`form-input ${errors.email ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="form-label">
                {t("password")}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`form-input ${errors.password ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("loading") : t("login")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("noAccount")}{" "}
            <Link to="/signup" className="text-brand-blue dark:text-blue-400 font-medium hover:underline">
              {t("signup")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
