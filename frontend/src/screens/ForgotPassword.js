import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader2 } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/reset-password", { email });
      toast.success(response.data.message);
      setEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send reset instructions"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
          ) : null}
          {isSubmitting ? "Sending..." : "Send Reset Instructions"}
        </button>
      </form>
    </div>
  );
};
