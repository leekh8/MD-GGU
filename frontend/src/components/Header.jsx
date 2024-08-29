import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-brand-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg md:text-2xl font-bold font-sans">
          {t("mdggu")}
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
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
        <div className="md:hidden relative">
          <button
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
                  onClick={() => setMenuOpen(false)}
                  className="block w-full h-full"
                >
                  {t("home")}
                </Link>
              </li>
              {user.username !== "Guest" ? (
                <>
                  <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                    <Link
                      to="/documents"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full h-full"
                    >
                      {t("documents")}
                    </Link>
                  </li>
                  <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                    <button
                      onClick={logout}
                      className="block w-full h-full text-left"
                    >
                      {t("logout")}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full h-full"
                    >
                      {t("login")}
                    </Link>
                  </li>
                  <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full h-full"
                    >
                      {t("signup")}
                    </Link>
                  </li>
                </>
              )}
              <li className="block px-4 py-2 text-sm hover:bg-gray-200">
                <Link
                  to="/editor"
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
