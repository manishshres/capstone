import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Dashboard from "../screens/Dashboard";

const Navbar = () => {
  const { authState, logout } = useContext(AuthContext);

  return (
    <header className="bg-glaucous shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center text-white text-3xl font-bold">
          Capestone
        </div>
        <nav>
          {authState.isAuthenticated ? (
            <>
              {/* <span className="text-white mr-4">
                Welcome, {authState.user.email || "User"}
              </span> */}
              <Link
                to="/dashboard"
                className="bg-glaucous-400 hover:bg-glaucous-500 text-white font-semibold py-2 px-4 rounded shadow mr-2 transition duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="bg-glaucous-400 hover:bg-glaucous-500 text-white font-semibold py-2 px-4 rounded shadow mr-2 transition duration-300"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="bg-saffron hover:bg-saffron-600 text-black font-bold py-2 px-4 rounded shadow transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-glaucous-400 hover:bg-glaucous-500 text-white font-semibold py-2 px-4 rounded shadow mr-2 transition duration-300"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-saffron hover:bg-saffron-600 text-black font-bold py-2 px-4 rounded shadow transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
