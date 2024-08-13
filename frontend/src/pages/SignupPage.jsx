import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const SignupPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    try {
      register(username, email, password);
      navigate("/"); // 회원가입 후 홈페이지로 리디렉션
    } catch (e) {
      setError("Signup failed: " + e.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 py-8 shadow-lg rounded-lg">
      <Helmet>
        <title>
          {t("mdggu")} ・ {t("signup")}
        </title>
      </Helmet>
      <h1 className="text-xl font-semibold text-center text-brand-blue">
        Sign Up for MD GGU
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
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
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
