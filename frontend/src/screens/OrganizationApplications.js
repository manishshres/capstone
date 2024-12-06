import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  FileCheck,
  ClockIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
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

const OrganizationApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [selectedJobId, statusFilter]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/volunteer/organization/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "/api/volunteer/organization/applications";
      const params = new URLSearchParams();

      if (statusFilter) params.append("status", statusFilter);
      if (selectedJobId) params.append("jobId", selectedJobId);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(response.data);
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch applications");
      setIsLoading(false);
    }
  };

  const updateStatus = async (jobId, volunteerId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/volunteer/jobs/${jobId}/applications/${volunteerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application status updated successfully");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update application status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Volunteer Applications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and manage volunteer applications
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Opportunity
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">All Opportunities</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {app.job?.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        Applicant: {app.volunteer?.name} ({app.volunteer?.email}
                        )
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                    {app.status === "pending" && (
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            updateStatus(
                              app.job._id,
                              app.volunteer._id,
                              "approved"
                            )
                          }
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(
                              app.job._id,
                              app.volunteer._id,
                              "rejected"
                            )
                          }
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Applicant's Message:</p>
                      <p className="mt-1">{app.motivationLetter}</p>
                    </div>
                    <div>
                      <p className="font-medium">Experience:</p>
                      <p>{app.experience}</p>
                    </div>
                    <div>
                      <p className="font-medium">Availability:</p>
                      <p>{app.availability}</p>
                    </div>
                    <div>
                      <p className="font-medium">Applied:</p>
                      <p>{new Date(app.appliedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {statusFilter || selectedJobId
                ? "No applications found with the selected filters"
                : "No applications received yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationApplications;
