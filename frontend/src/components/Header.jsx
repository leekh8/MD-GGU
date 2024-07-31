import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-brand-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg md:text-2xl font-bold font-sans">
          MD GGU
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className="hover:text-brand-yellow transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            {user.username !== "Guest" ? (
              <>
                <li>
                  <Link
                    to="/documents"
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    Documents
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    Logout
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
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-brand-yellow transition-colors duration-300"
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/editor"
                className="hover:text-brand-yellow transition-colors duration-300"
              >
                Editor
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
