import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  Loader2,
  PlusCircle,
  Edit,
} from "lucide-react";

const VolunteerJobs = () => {
  const { authState } = useContext(AuthContext);
  const isOrg = authState.user && authState.user.accountType === "org";
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      setIsLoading(true);

      const url = isOrg
        ? "/api/volunteer/organization/jobs"
        : "/api/volunteer/jobs";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.jobs);
    } catch (error) {
      toast.error("Failed to fetch volunteer opportunities");
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (jobId) => {
    navigate(`/volunteer/jobs/${jobId}/apply`);
  };

  const handleCreateJob = () => {
    navigate("/volunteer/jobs/create");
  };

  const handleEditJob = (jobId) => {
    navigate(`/volunteer/jobs/${jobId}/edit`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {isOrg ? "Posted Opportunities" : "Volunteer Opportunities"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isOrg
                  ? "Manage your volunteer opportunities"
                  : "Find and apply for volunteer positions in your community"}
              </p>
            </div>
            {isOrg && (
              <button
                onClick={handleCreateJob}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Opportunity
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.title || "Untitled Position"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Status: {job.status || "active"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isOrg ? (
                      <button
                        onClick={() => handleEditJob(job._id)}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job._id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-gray-600">
                  {job.description || "No description provided"}
                </p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location?.city && job.location?.state
                      ? `${job.location.city}, ${job.location.state}`
                      : "Location TBD"}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(job.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {job.startTime && job.endTime
                      ? `${job.startTime} - ${job.endTime}`
                      : "Time TBD"}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {job.spots?.filled || 0}/{job.spots?.total || 0} spots
                    filled
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
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

                {job.schedule && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      Schedule:{" "}
                      {job.schedule.frequency === "oneTime"
                        ? "One-time opportunity"
                        : job.schedule.frequency}
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
              {isOrg ? "No opportunities posted yet" : "No opportunities found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isOrg
                ? "Create your first volunteer opportunity to get started"
                : "Check back later for new opportunities"}
            </p>
            {isOrg && (
              <button
                onClick={handleCreateJob}
                className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mx-auto"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Opportunity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerJobs;
