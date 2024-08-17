import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-brand-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg md:text-2xl font-bold font-sans">
          {t("mdggu")}
        </Link>
        <nav className="hidden md:flex items-center">
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className="hover:text-brand-yellow transition-colors duration-300"
              >
                {t("home")}
              </Link>
            </li>
            {user.username !== "Guest" ? (
              <>
                <li>
                  <Link
                    to="/documents"
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    {t("documents")}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    {t("login")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    {t("signup")}
                  </Link>
                </li>
              </>
            )}
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
        <button className="md:hidden text-white focus:outline-none">
          {/* 햄버거 메뉴 아이콘 */}
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
      </div>
    </header>
  );
};

export default Header;
