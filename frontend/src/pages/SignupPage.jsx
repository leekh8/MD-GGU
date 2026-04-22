import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8)            s++;
  if (pw.length >= 12)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, label: "weak",   color: "bg-red-500" };
  if (s <= 3) return { level: 2, label: "fair",   color: "bg-yellow-400" };
  return            { level: 3, label: "strong", color: "bg-green-500" };
};

const SignupPage = () => {
  const { t }    = useTranslation();
  const auth     = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({});
  const [submitErr, setSubmitErr] = useState("");
  const [loading,  setLoading]  = useState(false);

  const strength = getStrength(password);

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value)                return t("fieldRequired");
      if (!EMAIL_RE.test(value)) return t("invalidEmail");
    }
    if (name === "password") {
      if (!value)          return t("fieldRequired");
      if (value.length < 8) return t("passwordTooShort");
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
      await auth.register(email, password);
      auth.setAuthMessage({ status: "success", message: t("registrationSuccessful") });
      navigate("/");
    } catch {
      setSubmitErr(t("emailAlreadyTaken"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("signup")}</title>
      </Helmet>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-8 border border-gray-100 dark:border-gray-800">

          <h1 className="text-2xl font-bold text-center text-brand-blue dark:text-white mb-1">
            {t("mdggu")}
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-7">
            {t("sign up for mdggu")}
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
                autoComplete="new-password"
                className={`form-input ${errors.password ? "border-red-400 focus:ring-red-400 focus:border-red-400" : ""}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              {/* 비밀번호 강도 */}
              {password && !errors.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.level ? strength.color : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {t(`passwordStrength.${strength.label}`)}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("loading") : t("signup")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("haveAccount")}{" "}
            <Link to="/login" className="text-brand-blue dark:text-blue-400 font-medium hover:underline">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
