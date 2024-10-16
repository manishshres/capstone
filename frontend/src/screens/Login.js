import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log(response.data);

      // Use the login method from AuthContext
      login(response.data.token);
      toast.success("Logged in successfully!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setIsLoading(false);
      navigate("/dashboard"); // Redirect to home or dashboard
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        setErrors({ general: err.response.data.error });
      } else {
        setErrors({ general: "An error occurred during login" });
      }
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-center text-black mb-6">
        Login
      </h2>
      {errors.general && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{errors.general}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-glaucous-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-glaucous-300 rounded-md shadow-sm focus:outline-none focus:ring-saffron focus:border-saffron"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-glaucous-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-glaucous-300 rounded-md shadow-sm focus:outline-none focus:ring-saffron focus:border-saffron"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-glaucous hover:bg-glaucous-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-glaucous"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <Link
          to="/register"
          className="text-sm text-glaucous-600 hover:text-glaucous-800"
        >
          Don't have an account? Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;
