import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobeAltIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

const LanguageSwitcher = ({ mobile = false }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  // 모바일 드롭다운은 인라인으로 표시 (모달 안에 들어가므로 오버레이 불필요)
  if (mobile) {
    return (
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => change(l.code)}
            className={`flex-1 py-1 text-xs rounded-md border transition-colors ${
              i18n.language === l.code
                ? "bg-brand-blue text-white border-brand-blue"
                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  // 데스크톱 드롭다운
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
        aria-label="Change language"
      >
        <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-xs uppercase tracking-wide">
          {current.code}
        </span>
        <ChevronDownIcon
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* 외부 클릭 닫기 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => change(l.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  i18n.language === l.code
                    ? "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-blue-300 font-medium"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
