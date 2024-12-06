import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();

  // If authentication is still loading, show nothing
  if (authState.isLoading) {
    return null;
  }

  // If user is authenticated, redirect to dashboard
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
