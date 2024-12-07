import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { authState, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <header className="bg-glaucous shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {authState.isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-3 mr-2 text-white hover:bg-glaucous-600 rounded-lg md:hidden"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
          <Link
            to="/"
            className="flex items-center text-white text-3xl font-bold"
          >
            {t("app.title")}
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          <LanguageSwitcher />
          {authState.isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-saffron hover:bg-saffron-600 text-black font-bold py-2 px-4 rounded shadow transition duration-300"
            >
              {t("app.logout")}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-glaucous-400 hover:bg-glaucous-500 text-white font-semibold py-2 px-4 rounded shadow transition duration-300"
              >
                {t("app.login")}
              </Link>
              <Link
                to="/register"
                className="bg-saffron hover:bg-saffron-600 text-black font-bold py-2 px-4 rounded shadow transition duration-300"
              >
                {t("app.register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
