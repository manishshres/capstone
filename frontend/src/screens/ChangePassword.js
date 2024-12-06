import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader2, Eye, EyeOff } from "lucide-react";

export const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/auth/change-password",
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting && (
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
          )}
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};
