import React, { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  UserCircle,
  HandHelping,
  Package,
  Clock,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  FileText,
  PlusCircle,
  ListChecks,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { authState, logout } = useContext(AuthContext);
  const isOrg = authState.user && authState.user.accountType === "org";
  const [isRequestsOpen, setIsRequestsOpen] = useState(true);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
      show: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircle,
      show: true,
    },
    {
      name: "Services",
      path: "/services",
      icon: HandHelping,
      show: isOrg,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
      show: isOrg,
    },
    {
      name: "Hours",
      path: "/hours",
      icon: Clock,
      show: isOrg,
    },
  ];

  const requestMenuItems = [
    {
      name: "New Request",
      path: "/request-services/new",
      icon: PlusCircle,
      show: !isOrg,
    },
    {
      name: "My Requests",
      path: "/request-services",
      icon: ListChecks,
      show: !isOrg,
    },
    {
      name: "Service Requests",
      path: "/service-requests",
      icon: FileText,
      show: isOrg,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {isOrg ? "Organization Portal" : "User Portal"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{authState.user?.email}</p>
      </div>

      <nav className="flex-grow p-4">
        {menuItems.map(
          (item) =>
            item.show && (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                flex items-center px-4 py-2 text-sm font-medium rounded-md mb-1
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                transition-colors duration-150 ease-in-out
              `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
        )}

        {/* Requests Dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setIsRequestsOpen(!isRequestsOpen)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
          >
            <HandHelping className="mr-3 h-5 w-5" />
            <span>Requests</span>
            <ChevronDown
              className={`ml-auto h-4 w-4 transform transition-transform ${
                isRequestsOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isRequestsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {requestMenuItems.map(
                (item) =>
                  item.show && (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `
                      flex items-center px-4 py-2 text-sm font-medium rounded-md
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                      transition-colors duration-150 ease-in-out
                    `}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  )
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 ease-in-out"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
