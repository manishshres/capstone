import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const validateToken = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        throw new Error("Token expired");
      }

      // Set auth state with decoded token info
      setAuthState({
        token,
        isAuthenticated: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          accountType: decoded.accountType,
        },
        isLoading: false,
      });

      // Optionally verify with backend
      await axios.get("/api/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      localStorage.removeItem("token");
      setAuthState({
        token: null,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await validateToken(token);
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []); // Empty dependency array

  const login = async (token) => {
    localStorage.setItem("token", token);
    await validateToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
