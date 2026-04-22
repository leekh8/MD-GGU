import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const NAV_LINK_BASE =
  "text-sm font-medium transition-colors duration-200 hover:text-brand-yellow";
const NAV_LINK_ACTIVE = "text-brand-yellow";

const Header = () => {
  const { t }                   = useTranslation();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // 외부 클릭 시 모바일 메뉴 닫기
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      setTimeout(() => document.addEventListener("click", handler), 100);
    }
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  // 다크모드 적용
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  // 공통 nav 항목
  const navItems = user
    ? [
        { to: "/documents", label: t("documents") },
        { to: "/editor",    label: t("editor") },
        { to: "/mypage",    label: t("myPage") },
        ...(user.role === "ADMIN" ? [{ to: "/admin", label: t("adminPage") }] : []),
      ]
    : [
        { to: "/editor", label: t("editor") },
        { to: "/login",  label: t("login") },
        { to: "/signup", label: t("signup") },
      ];

  if (loading) return null;

  return (
    <header className="bg-brand-blue dark:bg-gray-900 border-b border-brand-blue-dark dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-12 px-4">
        {/* 로고 */}
        <Link
          to="/"
          className="text-white font-bold text-lg tracking-tight hover:text-brand-yellow transition-colors"
        >
          {t("mdggu")}
        </Link>

        {/* 데스크톱 nav */}
        <nav className="hidden md:flex items-center gap-5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${NAV_LINK_BASE} text-white ${isActive ? NAV_LINK_ACTIVE : ""}`
            }
          >
            {t("home")}
          </NavLink>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${NAV_LINK_BASE} text-white ${isActive ? NAV_LINK_ACTIVE : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && (
            <button
              onClick={logout}
              className={`${NAV_LINK_BASE} text-white`}
            >
              {t("logout")}
            </button>
          )}

          {/* 구분선 */}
          <div className="h-4 w-px bg-white/20" />

          {/* 언어 전환 */}
          <LanguageSwitcher />

          {/* 다크모드 토글 */}
          <button
            onClick={() => setIsDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            {isDarkMode
              ? <SunIcon  className="w-4.5 h-4.5" />
              : <MoonIcon className="w-4.5 h-4.5" />}
          </button>
        </nav>

        {/* 모바일: 다크모드 + 햄버거 */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
            className="p-1.5 text-white/70 hover:text-white transition-colors"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              aria-label="Toggle menu"
              className="p-1.5 text-white hover:text-brand-yellow transition-colors"
            >
              {menuOpen
                ? <XMarkIcon className="w-5 h-5" />
                : <Bars3Icon className="w-5 h-5" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("home")}
                </Link>

                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                {user && (
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t("logout")}
                  </button>
                )}

                {/* 구분선 */}
                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                {/* 언어 선택 */}
                <div className="px-4 py-2.5">
                  <LanguageSwitcher mobile />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
