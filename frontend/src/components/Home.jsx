import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AuthMessage from "./AuthMessage";

const HomePage = () => {
  const { t }    = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>{t("welcome to mdggu")}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-16 text-center">
        <AuthMessage />

        <h1 className="text-4xl font-bold text-brand-blue dark:text-white mb-3">
          {t("welcome to mdggu")}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
          {user && user.username !== "GUEST"
            ? t("welcomeUser", { username: user.username })
            : t("Explore our features to optimize your markdown documents!")}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/editor" className="btn btn-primary px-6 py-2.5 text-base">
            {t("start editing")}
          </Link>
          <Link to="/documents" className="btn btn-secondary px-6 py-2.5 text-base">
            {t("view documents")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomePage;
