import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();

  // If authentication is still loading, show nothing or a loader
  if (authState.isLoading) {
    return null;
  }

  // Check if user is authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Check role-based access if roles are specified
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(authState.user?.accountType)
  ) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
