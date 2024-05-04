// 전체 앱의 헤더
import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-blue-600 text-white py-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-lg md:text-2xl font-bold">MD GGU</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link
              to="/"
              className="hover:text-gray-200 transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/docs"
              className="hover:text-gray-200 transition-colors duration-300"
            >
              Documents
            </Link>
          </li>
          <li>
            <Link
              to="/editor"
              className="hover:text-gray-200 transition-colors duration-300"
            >
              Editor
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

export default Header;
