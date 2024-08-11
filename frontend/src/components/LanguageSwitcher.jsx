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
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center text-white hover:text-brand-yellow py-1 px-2 rounded-md transition-colors duration-200">
          <GlobeAltIcon className="w-5 h-5 mr-1" aria-hidden="true" />
          <ChevronDownIcon className="w-4 h-4 ml-2" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Menu.Items className="absolute right-0 w-max mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={() => changeLanguage("ko")}
                className={`${
                  active ? "bg-brand-gray-light text-gray-900" : "text-gray-700"
                } group flex rounded-md items-center w-full px-4 py-2 text-sm`}
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
                  active ? "bg-brand-gray-light text-gray-900" : "text-gray-700"
                } group flex rounded-md items-center w-full px-4 py-2 text-sm`}
              >
                English
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default LanguageSwitcher;
