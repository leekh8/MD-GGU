import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <div>t("loading")</div>;
  }

  const renderMenuItems = (isMobile) => {
    const hoverClass = isMobile
      ? "block px-4 py-2 text-sm hover:bg-gray-200" // 모바일 호버 스타일
      : "hover:text-brand-yellow transition-colors duration-300"; // 일반 호버 스타일

    if (user.username !== "Guest") {
      // 로그인 했다면
      return (
        <>
          <li>
            <Link
              to="/documents"
              onClick={() => isMobile && setMenuOpen(false)}
              className={hoverClass}
            >
              {t("documents")}
            </Link>
          </li>
          {user.role === "ADMIN" && (
            <li>
              <Link
                to="/admin"
                onClick={() => isMobile && setMenuOpen(false)}
                className={hoverClass}
              >
                {t("admin")}
              </Link>
            </li>
          )}
          <li>
            <button onClick={logout} className={hoverClass}>
              {t("logout")}
            </button>
          </li>
        </>
      );
    } else {
      // 로그인하지 않았다면
      return (
        <>
          <li>
            <Link
              to="/login"
              onClick={() => isMobile && setMenuOpen(false)}
              className={hoverClass}
            >
              {t("login")}
            </Link>
          </li>
          <li>
            <Link
              to="/signup"
              onClick={() => isMobile && setMenuOpen(false)}
              className={hoverClass}
            >
              {t("signup")}
            </Link>
          </li>
        </>
      );
    }
  };

  return (
    <header className="bg-brand-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-lg md:text-2xl font-bold font-sans"
          aria-label="홈페이지로 이동"
        >
          {t("mdggu")}
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                aria-label="홈페이지로 이동"
                className="hover:text-brand-yellow transition-colors duration-300"
              >
                {t("home")}
              </Link>
            </li>
            {renderMenuItems(false)}
            <li>
              <Link
                to="/editor"
                aria-label="편집기로 이동"
                className="hover:text-brand-yellow transition-colors duration-300"
              >
                {t("editor")}
              </Link>
            </li>
            <li>
              <LanguageSwitcher />
            </li>
          </ul>
        </nav>
        <div className="md:hidden relative">
          <button
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
            className="text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          {menuOpen && (
            <ul className="absolute right-0 mt-2 py-2 w-30 bg-white text-black rounded-lg shadow-lg">
              <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                <Link
                  to="/"
                  aria-label="홈페이지로 이동"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full h-full"
                >
                  {t("home")}
                </Link>
              </li>
              {renderMenuItems(true)}
              <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                <Link
                  to="/editor"
                  aria-label="편집기로 이동"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full h-full"
                >
                  {t("editor")}
                </Link>
              </li>
              <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                <LanguageSwitcher />
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
