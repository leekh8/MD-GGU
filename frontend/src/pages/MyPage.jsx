import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const MyPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [method, setMethod] = useState("deep_learning"); // 닉네임 생성 방식 상태
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
    }
  }, [user]);

  // 랜덤 닉네임 생성 함수
  const generateRandomNickname = async () => {
    const method = document.getElementById("method").value; // 닉네임 생성 방식 선택
    const seedText = document.getElementById("seedText").value; // 시작 문자열 입력
    const numChars = document.getElementById("numChars").value; // 닉네임 길이 입력

    try {
      const response = await fetch(
        `/generate_nickname?method=${method}&seed_text=${seedText}&num_chars=${numChars}`
      );
      const data = await response.json();

      if (data.error) {
        alert(data.error); // 에러 메시지 표시
      } else {
        setUsername(data.nickname); // 생성된 닉네임 설정
      }
    } catch (error) {
      console.error("닉네임 생성 실패:", error);
      alert("닉네임 생성에 실패했습니다.");
    }
  };

  const toggleMethod = () => {
    setMethod((prevMethod) =>
      prevMethod === "deep_learning" ? "markov_chain" : "deep_learning"
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // 닉네임 유효성 검증
    if (username.length < 2 || username.length > 20) {
      setError(t("usernameLengthError"));
      return;
    }
    if (!username.matches("^[a-zA-Z0-9._-]+$")) {
      setError(t("usernameCharacterError"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    // TODO: 현재 비밀번호 확인 로직 추가
    try {
      // TODO: 비밀번호 암호화 로직 추가
      const updatedUser = { ...user, email, username, password };
      await updateUser(updatedUser);
      // 성공적으로 업데이트 되면 메시지 표시 또는 페이지 이동
    } catch (error) {
      setError(error.message || t("failedToUpdateProfile"));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 py-8 shadow-lg rounded-lg">
      <Helmet>
        <title>
          {t("mdggu")} ・ {t("myPage")}
        </title>
      </Helmet>
      <h1 className="text-xl font-semibold text-center text-brand-blue">
        {t("myPage")}
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            {t("username")}
          </label>
          <div className="flex">
            <input
              type="text"
              id="username"
              placeholder={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:  
ring-brand-blue focus:border-brand-blue sm:text-sm"
            />
            <button
              type="button"
              onClick={() => {
                generateRandomNickname();
                toggleMethod();
              }} // 버튼 클릭 시 닉네임 생성 및 방식 전환
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded shadow"
            >
              {t("generate")}
            </button>
          </div>
        </div>
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
            readOnly
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-smfocus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            {t("newPassword")}
          </label>
          <input
            type="password"
            id="password"
            placeholder={t("newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  
focus:outline-none focus:ring-brand-blue  
focus:border-brand-blue sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            {t("confirmPassword")}
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder={t("confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue  
focus:border-brand-blue sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        >
          {t("updateProfile")}
        </button>
      </form>
    </div>
  );
};

export default MyPage;
