import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./screens/Register";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;