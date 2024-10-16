import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import the jwt-decode library

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    user: {},
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (authState.token) {
        try {
          const response = await axios.get("http://localhost:3000/api/auth", {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          });
          setAuthState({
            ...authState,
            isAuthenticated: true,
            user: response.data.user,
          });
        } catch (err) {
          localStorage.removeItem("token");
          setAuthState({
            token: null,
            isAuthenticated: false,
            user: null,
          });
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token); // Decode the token
    setAuthState({
      ...authState,
      token,
      isAuthenticated: true,
      user: {
        email: decodedToken.email, // Extract the email from the decoded token
      },
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
