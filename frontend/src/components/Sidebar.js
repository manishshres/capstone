import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  UserCircle,
  HandHelping,
  Package,
  Clock,
  Settings,
  ShieldPlus,
  LogOut,
  Home,
  Briefcase,
  Users,
  CalendarCheck,
  FileCheck,
  Building2,
  PlusCircle,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { authState, logout } = useContext(AuthContext);
  const isOrg = authState.user && authState.user.accountType === "org";
  const isVolunteer = authState.user && authState.user.accountType === "org";

  const baseMenuItems = [
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
  ];

  const orgMenuItems = [
    // {
    //   name: "Services",
    //   path: "/services",
    //   icon: HandHelping,
    //   show: isOrg,
    // },
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

  const volunteerMenuItems = [
    {
      name: "Add Services",
      path: "/add-request-services",
      icon: ShieldPlus,
      show: isOrg,
    },
    {
      name: "Create Request Services",
      path: "/create-request-services",
      icon: HandHelping,
      show: !isOrg,
    },
    {
      name: "View Request Services",
      path: "/view-request-services",
      icon: HandHelping,
      show: true,
    },
  ];

  // New volunteer management sections
  const volunteerSection = [
    {
      name: "Available Jobs",
      path: "/volunteer/jobs",
      icon: Briefcase,
      show: !isOrg,
    },
    {
      name: "My Applications",
      path: "/volunteer/applications",
      icon: FileCheck,
      show: !isOrg,
    },
    {
      name: "My Schedule",
      path: "/volunteer/schedule",
      icon: CalendarCheck,
      show: !isOrg,
    },
  ];

  const orgVolunteerSection = [
    {
      name: "Volunteer Posts",
      path: "/volunteer/volunteer-jobs",
      icon: Briefcase,
      show: isOrg,
    },
    {
      name: "Post New Job",
      path: "/volunteer-jobs/create",
      icon: PlusCircle,
      show: isOrg,
    },
    {
      name: "Applications",
      path: "/organization/applications",
      icon: FileCheck,
      show: isOrg,
    },
    {
      name: "Volunteers",
      path: "/volunteers",
      icon: Users,
      show: isOrg,
    },
  ];

  const renderNavLink = (item) => (
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
  );

  const renderSection = (title, items) => {
    const filteredItems = items.filter((item) => item.show);
    if (filteredItems.length === 0) return null;

    return (
      <div className="py-4">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className="mt-2 space-y-1">{filteredItems.map(renderNavLink)}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="ml-2 text-xl font-semibold text-gray-800">
            {isOrg
              ? "Organization Portal"
              : isVolunteer
              ? "Volunteer Portal"
              : "User Portal"}
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">{authState.user?.email}</p>
      </div>

      <nav className="flex-grow px-4 py-2 overflow-y-auto">
        {renderSection("Menu", baseMenuItems)}
        {renderSection("Organization", orgMenuItems)}
        {renderSection("Services", volunteerMenuItems)}
        {renderSection("Volunteer", volunteerSection)}
        {renderSection("Volunteer Management", orgVolunteerSection)}
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
