import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "components/PrivateRoute";
import AuthProvider from "./contexts/AuthContext";

// Screens
import Dashboard from "./screens/Dashboard";
import Profile from "./screens/Profile";
import Services from "./screens/Services";
import Inventory from "screens/Inventory";
import CreateServiceRequest from "screens/CreateServiceRequest";
import Shelters from "screens/Shelters";
import ViewServiceRequest from "screens/ViewServiceRequest";
import VolunteerJobs from "screens/VolunteerJobs";
import VolunteerJobForm from "./components/VolunteerJobForm";
import ApplyVolunteerJob from "./screens/ApplyVolunteerJob";
import MyApplications from "screens/MyApplications";
import OrganizationApplications from "screens/OrganizationApplications";
import OrganizationVolunteers from "screens/OrganizationVolunteers";
import { ForgotPassword } from "screens/ForgotPassword";
import { ChangePassword } from "screens/ChangePassword";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            {/* Protected Routes - All Users */}
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
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePassword />
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
              path="/volunteer/jobs"
              element={
                <PrivateRoute>
                  <VolunteerJobs />
                </PrivateRoute>
              }
            />

            {/* Organization Routes */}
            <Route
              path="/add-request-services"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <Services />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/shelters/:id"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <Shelters />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer-jobs/create"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <VolunteerJobForm mode="create" />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer/jobs/:jobId/edit"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <VolunteerJobForm mode="edit" />
                </PrivateRoute>
              }
            />
            <Route
              path="/organization/applications"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <OrganizationApplications />
                </PrivateRoute>
              }
            />
            <Route
              path="/organization/volunteers"
              element={
                <PrivateRoute allowedRoles={["org"]}>
                  <OrganizationVolunteers />
                </PrivateRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/create-request-services"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <CreateServiceRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer/jobs/:jobId/apply"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <ApplyVolunteerJob />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer/applications"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <MyApplications />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
