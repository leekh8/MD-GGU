import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setSelectedLanguage(lng);
  };

  return (
    <Menu as="div" className="relative inline-block text-left ">
      <div>
        <Menu.Button className="flex items-center py-0.5 px-1 rounded-md">
          <GlobeAltIcon className="w-5 h-5 mr-1" aria-hidden="true" />
          <ChevronDownIcon className="w-4 h-4 ml-1" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute right-0 mt-2 py-2 w-36 bg-white text-black rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <Menu.Item>
          {({ active }) => (
            <button
              type="button"
              onClick={() => changeLanguage("ko")}
              className={`${
                active ? "bg-brand-gray-light " : "dropdown-item"
              } block w-full text-left px-4 py-2 text-sm`}
            >
              한국어
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`${
                active ? "bg-brand-gray-light " : "dropdown-item"
              } block w-full text-left px-4 py-2 text-sm`}
            >
              English
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

export default LanguageSwitcher;
