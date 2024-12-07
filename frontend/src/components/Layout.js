import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Common/Navbar";
import Sidebar from "./Common/Sidebar";
import Footer from "./Common/Footer";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const noSidebarPaths = ["/login", "/register", "/", "/about"];
  const showSidebar =
    authState.isAuthenticated && !noSidebarPaths.includes(location.pathname);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex-grow flex">
        {showSidebar && (
          <>
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed md:relative inset-y-0 left-0 transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 transition-transform duration-300 ease-in-out z-30 md:z-0 w-64 bg-white border-r border-gray-200`}
            >
              <div className="h-[calc(100vh-4rem)] overflow-hidden">
                <Sidebar />
              </div>
            </aside>
          </>
        )}

        <main className="flex-grow transition-all duration-300 ease-in-out overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
