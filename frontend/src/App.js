import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Layout from "./components/Layout";
import AuthProvider from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./screens/Dashboard";
import Profile from "./screens/Profile";
import Services from "./screens/Services";
import Inventory from "screens/Inventory";
import RequestServices from "screens/RequestServices";
import Shelters from "screens/Shelters";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/services"
              element={
                <PrivateRoute>
                  <Services />
                </PrivateRoute>
              }
            />

            <Route
              path="/request-services"
              element={
                <PrivateRoute>
                  <RequestServices />
                </PrivateRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />

            <Route
              path="/shelters/:id"
              element={
                <PrivateRoute>
                  <Shelters />
                </PrivateRoute>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
