import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  Loader2,
} from "lucide-react";

// Import the mock data
const MOCK_VOLUNTEER_JOB = {
  id: "vj1",
  title: "Community Food Bank Assistant",
  description:
    "Join our team of dedicated volunteers helping to sort and distribute food to families in need. Your work will directly impact food security in our community.",
  type: "recurring",
  date: "2024-12-15",
  startTime: "09:00",
  endTime: "13:00",
  location: "Springfield Community Food Bank",
  address: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  spots: 10,
  requirements: `- Must be 18 or older
- Able to lift 25 pounds
- Food handling certification preferred
- Reliable transportation
- Commitment to food safety protocols`,
  benefits: `- Hands-on experience in food bank operations
- Volunteer certification provided
- Free lunch during shifts
- Letter of recommendation available
- Flexible scheduling options`,
  skills: [
    "Organization",
    "Teamwork",
    "Communication",
    "Physical Stamina",
    "Time Management",
    "Food Safety",
    "Inventory Management",
  ],
  status: "active",
  schedule: {
    frequency: "weekly",
    days: ["Monday", "Wednesday"],
    duration: "3 months",
  },
  organization: {
    name: "Springfield Food Bank",
    logo: "/placeholder-logo.png",
  },
};

// Create an array of mock jobs
const MOCK_JOBS = [MOCK_VOLUNTEER_JOB];

const VolunteerJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    location: "",
    date: "",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, you would fetch filtered data from the API
    console.log("Searching with filters:", filters);
  };

  const handleApply = (jobId) => {
    navigate(`/volunteer/jobs/${jobId}/apply`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            Volunteer Opportunities
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Find and apply for volunteer positions in your community
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="">All Types</option>
                  <option value="oneTime">One-time</option>
                  <option value="recurring">Recurring</option>
                  <option value="flexible">Flexible</option>
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search Opportunities
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {job.organization.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply Now
                  </button>
                </div>

                <p className="mt-4 text-gray-600">{job.description}</p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.city}, {job.state}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(job.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {job.startTime} - {job.endTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {job.spots} spots available
                  </div>
                </div>

                {job.skills && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No opportunities found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerJobs;
