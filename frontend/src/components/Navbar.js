import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-500 text-white">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            to="/"
            className="hover:bg-blue-700 px-3 py-2 rounded transition duration-300 ease-in-out"
          >
            Home
          </Link>
          <Link
            to="/documents"
            className="hover:bg-blue-700 px-3 py-2 rounded transition duration-300 ease-in-out"
          >
            Documents
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
