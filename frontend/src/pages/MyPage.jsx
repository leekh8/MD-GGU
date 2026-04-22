import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const PYTHON_URL = import.meta.env.VITE_PYTHON_URL || "";

const MyPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [email, setEmail]               = useState("");
  const [username, setUsername]         = useState("");
  const [method, setMethod]             = useState("deep_learning");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setUsername(user.username || "");
    }
  }, [user]);

  // 랜덤 닉네임 생성
  const generateRandomNickname = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `${PYTHON_URL}/generate_nickname?method=${method}&seed_text=md&num_chars=8`
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUsername(data.nickname);
        // 다음 호출 때 방식 교체
        setMethod((prev) => (prev === "deep_learning" ? "markov_chain" : "deep_learning"));
      }
    } catch {
      setError(t("nicknameGenerateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (username.length < 2 || username.length > 20) {
      setError(t("usernameLengthError"));
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setError(t("usernameCharacterError"));
      return;
    }
    if (password && password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = { ...user, email, username, ...(password ? { password } : {}) };
      await updateUser(updatedUser);
      setSuccess(t("profileUpdated"));
      setPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message || t("failedToUpdateProfile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("mdggu")} ・ {t("myPage")}</title>
      </Helmet>
      <div className="max-w-lg mx-auto mt-10 px-6 py-8 shadow-lg rounded-lg bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center text-brand-blue dark:text-white mb-6">
          {t("myPage")}
        </h1>

        {error && (
          <p className="text-red-500 text-center text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-center text-sm mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 닉네임 */}
          <div>
            <label htmlFor="username" className="form-label">
              {t("username")}
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                id="username"
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input mt-0 flex-1"
              />
              <button
                type="button"
                onClick={generateRandomNickname}
                disabled={isGenerating}
                className="btn btn-secondary whitespace-nowrap disabled:opacity-60"
              >
                {isGenerating ? "..." : t("generate")}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t("usernameHint")}
            </p>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <label htmlFor="email" className="form-label">
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              className="form-input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label htmlFor="password" className="form-label">
              {t("newPassword")}
              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                ({t("leaveBlankToKeep")})
              </span>
            </label>
            <input
              type="password"
              id="password"
              placeholder={t("newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder={t("confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("loading") : t("updateProfile")}
          </button>
        </form>
      </div>
    </>
  );
};

export default MyPage;
