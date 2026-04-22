import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: "weak",   color: "bg-red-500"    };
  if (score <= 3) return { level: 2, label: "fair",   color: "bg-yellow-400" };
  return            { level: 3, label: "strong", color: "bg-green-500"  };
};

const SignupPage = () => {
  const { t } = useTranslation();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth     = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("allFieldsRequired"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      await auth.register(email, password);
      auth.setAuthMessage({ status: "success", message: t("registrationSuccessful") });
      navigate("/");
    } catch (e) {
      setError(t("emailAlreadyTaken"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("signup")}</title>
      </Helmet>
      <div className="max-w-lg mx-auto mt-10 px-6 py-8 shadow-lg rounded-lg bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-brand-blue dark:text-white mb-6">
          {t("sign up for mdggu")}
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
              autoComplete="new-password"
            />
            {/* 비밀번호 강도 표시 */}
            {password && (
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
            disabled={isLoading}
            className="w-full btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t("loading") : t("signup")}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("haveAccount")}{" "}
          <Link to="/login" className="text-brand-blue dark:text-blue-400 hover:underline font-medium">
            {t("login")}
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupPage;
