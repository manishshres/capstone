import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("user");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        { name, email, password, accountType }
      );

      login(response.data.token);
      setSuccessMessage("Account created successfully!");
      setIsLoading(false);
      setTimeout(() => {
        navigate("/dashboard");
      }, 650); // Redirect to dashboard
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        if (err.response.data.error) {
          setErrors({ general: err.response.data.error });
        } else {
          setErrors(err.response.data);
        }
      } else {
        setErrors({ general: "An error occurred during registration" });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-center text-black mb-6">
        Register
      </h2>
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
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
            htmlFor="name"
            className="block text-sm font-medium text-glaucous-700"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-glaucous-300 rounded-md shadow-sm focus:outline-none focus:ring-saffron focus:border-saffron"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
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
            autoComplete="new-password"
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
          <label
            htmlFor="accountType"
            className="block text-sm font-medium text-glaucous-700"
          >
            Account Type
          </label>
          <select
            id="accountType"
            name="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-glaucous-300 rounded-md shadow-sm focus:outline-none focus:ring-saffron focus:border-saffron"
          >
            <option value="user">User</option>
            <option value="org">Organization</option>
          </select>
          {errors.accountType && (
            <p className="mt-2 text-sm text-red-600">{errors.accountType}</p>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-glaucous hover:bg-glaucous-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-glaucous"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-glaucous-600 hover:text-glaucous-800"
        >
          Already have an account? Login here
        </Link>
      </div>
    </div>
  );
};

export default Register;
