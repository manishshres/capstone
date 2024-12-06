import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  FileCheck,
  ClockIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Building2,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };

  const StatusIcon = {
    pending: ClockIcon,
    approved: CheckCircle,
    rejected: XCircle,
    completed: FileCheck,
  };

  const Icon = StatusIcon[status] || AlertCircle;

  return (
    <span
      className={`px-3 py-1 rounded-full flex items-center gap-1 w-fit ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="capitalize">{status}</span>
    </span>
  );
};

const MyApplications = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/volunteer/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/volunteer/applications/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Application withdrawn successfully");
      fetchApplications();
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                My Applications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your volunteer applications
              </p>
            </div>
            <button
              onClick={() => navigate("/volunteer/jobs")}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse Opportunities
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {app.job.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {app.job.organization?.name || "Organization"}
                    </p>
                  </div>
                  {app.status === "pending" && (
                    <button
                      onClick={() => handleWithdraw(app.job._id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Withdraw Application
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <StatusBadge status={app.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {app.job.location?.city}, {app.job.location?.state}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="h-4 w-4 mr-2" />
                    {app.job.organization?.email}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Your Message</h3>
                    <p className="mt-1 text-gray-600">{app.motivationLetter}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Availability
                      </h3>
                      <p className="mt-1 text-gray-600">{app.availability}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Experience</h3>
                      <p className="mt-1 text-gray-600">{app.experience}</p>
                    </div>
                  </div>

                  {app.skills && app.skills.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {app.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {app.status === "approved" && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="text-green-800 font-medium">Next Steps</h3>
                    <p className="mt-1 text-green-700">
                      Your application has been approved! Please check your
                      email for further instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by browsing available volunteer opportunities
            </p>
            <button
              onClick={() => navigate("/volunteer/jobs")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Browse Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
