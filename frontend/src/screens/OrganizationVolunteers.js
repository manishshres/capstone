import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";

const OrganizationVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/volunteer/organization/volunteers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVolunteers(response.data.volunteers);
    } catch (error) {
      toast.error("Failed to fetch volunteers");
      console.error("Error fetching volunteers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHours = async (jobId, volunteerId, hours) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/volunteer/jobs/${jobId}/volunteers/${volunteerId}/hours`,
        { hours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Hours updated successfully");
      fetchVolunteers();
    } catch (error) {
      toast.error("Failed to update hours");
      console.error("Error updating hours:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Manage Volunteers
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage your organization's volunteers
              </p>
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredVolunteers.length > 0 ? (
          filteredVolunteers.map((volunteer) => (
            <div
              key={volunteer._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {volunteer.name}
                    </h2>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {volunteer.email}
                      </div>
                      {volunteer.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {volunteer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {volunteer.totalHours || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Applications
                  </h3>
                  <div className="space-y-4">
                    {volunteer.applications.map((app) => (
                      <div
                        key={app.job._id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {app.job.title}
                            </h4>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(app.job.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {app.job.location.city},{" "}
                                {app.job.location.state}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={app.application.hoursCompleted || 0}
                              onChange={(e) =>
                                handleUpdateHours(
                                  app.job._id,
                                  volunteer._id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                              disabled={isUpdating}
                            />
                            <span className="text-sm text-gray-500">hours</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No volunteers found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No volunteers match your search criteria"
                : "You don't have any volunteers yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationVolunteers;
