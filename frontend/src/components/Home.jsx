import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";
import { HelmetProvider, Helmet } from "react-helmet-async";
import AuthMessage from "./AuthMessage";

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container mx-auto my-4 px-4 py-8">
      <HelmetProvider>
        <Helmet>
          <title>{t("welcome to mdggu")}</title>
        </Helmet>
      </HelmetProvider>
      <AuthMessage /> {/* 메시지 표시 컴포넌트 */}
      <h1 className="text-3xl font-bold text-center text-brand-blue mb-6">
        {t("welcome to mdggu")}
      </h1>
      <p className="text-xl text-center text-brand-gray mb-8">
        {user && user.username !== "GUEST"
          ? t("welcomeUser", { username: user.username })
          : t("Explore our features to optimize your markdown documents!")}
      </p>
      <div className="flex flex-col items-center md:flex-row justify-center gap-4">
        <Link
          to="/documents"
          className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-strong max-w-xs md:max-w-xs text-center"
        >
          {t("view documents")}
        </Link>
        <Link
          to="/editor"
          className="bg-brand-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow-strong max-w-xs md:max-w-xs text-center"
        >
          {t("start editing")}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
