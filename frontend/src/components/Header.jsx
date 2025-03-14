import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const { t } = useTranslation();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const menuItems = (isMobile) => {
    const linkClass = isMobile
      ? "block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
      : "hover:text-brand-yellow transition-colors duration-300";

    return user ? (
      <>
        <li>
          <Link
            to="/documents"
            onClick={() => isMobile && setMenuOpen(false)}
            className={linkClass}
          >
            {t("documents")}
          </Link>
        </li>
        <li>
          <Link
            to="/mypage"
            onClick={() => isMobile && setMenuOpen(false)}
            className={linkClass}
          >
            {t("myPage")}
          </Link>
        </li>
        <li>
          <button onClick={logout} className={`${linkClass} w-full `}>
            {t("logout")}
          </button>
        </li>
        {user?.role === "ADMIN" && (
          <li>
            <Link
              to="/admin"
              onClick={() => isMobile && setMenuOpen(false)}
              className={linkClass}
            >
              {t("adminPage")}
            </Link>
          </li>
        )}
      </>
    ) : (
      <>
        <li>
          <Link
            to="/login"
            onClick={() => isMobile && setMenuOpen(false)}
            className={linkClass}
          >
            {t("login")}
          </Link>
        </li>
        <li>
          <Link
            to="/signup"
            onClick={() => isMobile && setMenuOpen(false)}
            className={linkClass}
          >
            {t("signup")}
          </Link>
        </li>
      </>
    );
  };

  if (loading) return <div>{t("loading")}</div>;

  return (
    <header className="bg-brand-blue text-white py-3 dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg md:text-2xl font-bold font-sans">
          {t("mdggu")}
        </Link>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex items-center space-x-6">
          <nav>
            <ul className="flex items-center space-x-4">
              <li>
                <Link
                  to="/"
                  className="hover:text-brand-yellow transition-colors duration-300"
                >
                  {t("home")}
                </Link>
              </li>
              {menuItems(false)}
              <li>
                <Link
                  to="/editor"
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

          {/* 다크 모드 토글 버튼 (데스크톱) */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="p-2 rounded-full transition-opacity opacity-70 hover:opacity-100 focus:outline-none flex items-center"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-yellow-400" />
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="text-white focus:outline-none"
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
            <ul className="absolute right-0 mt-2 py-2 w-48 bg-white text-black rounded-lg shadow-lg text-center dark:bg-gray-800 dark:text-white">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600"
                >
                  {t("home")}
                </Link>
              </li>
              {menuItems(true)}
              <li>
                <Link
                  to="/editor"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600"
                >
                  {t("editor")}
                </Link>
              </li>
              <li>
                <LanguageSwitcher />
              </li>
              {/* 다크 모드 토글 버튼 (모바일) */}
              <li className="px-4 py-2 text-sm flex justify-center">
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className="flex items-center space-x-2 transition-opacity opacity-70 hover:opacity-100 active:opacity-100"
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-gray-400" />
                  )}
                  <span>{isDarkMode ? t("lightMode") : t("darkMode")}</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
