import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { authState } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;
  const isOrg = authState.user && authState.user.accountType === "org";

  return (
    <nav className="w-full md:w-48 bg-white shadow-md rounded-md p-4 mb-4 md:mr-4 md:mb-0">
      <ul className="space-y-2">
        <li
          className={`p-2 rounded ${isActive("/profile") ? "bg-blue-100" : ""}`}
        >
          <NavLink to="/profile">Profile</NavLink>
        </li>
        {isOrg && (
          <>
            <li
              className={`p-2 rounded ${
                isActive("/services") ? "bg-blue-100" : ""
              }`}
            >
              <NavLink to="/services">Services</NavLink>
            </li>
            <li
              className={`p-2 rounded ${
                isActive("/inventory") ? "bg-blue-100" : ""
              }`}
            >
              <NavLink to="/inventory">Inventory</NavLink>
            </li>
            <li
              className={`p-2 rounded ${
                isActive("/hours") ? "bg-blue-100" : ""
              }`}
            >
              <NavLink to="/hours">Hours</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
