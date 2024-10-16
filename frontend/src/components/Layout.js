import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <ToastContainer />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
