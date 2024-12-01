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
import CreateServiceRequest from "screens/CreateServiceRequest";
import Shelters from "screens/Shelters";
import ViewServiceRequest from "screens/ViewServiceRequest";

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
              path="/add-request-services"
              element={
                <PrivateRoute>
                  <Services />
                </PrivateRoute>
              }
            />

            <Route
              path="/create-request-services"
              element={
                <PrivateRoute>
                  <CreateServiceRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-request-services"
              element={
                <PrivateRoute>
                  <ViewServiceRequest />
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
