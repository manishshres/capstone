import React, { useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";
import ShelterList from "../components/ShelterList";
import ShelterDetails from "../components/ShelterDetails";

const Dashboard = () => {
  const [shelters, setShelters] = useState([]);
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);

  const fetchShelters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/shelters?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShelters(response.data);
    } catch (error) {
      setError("An error occurred while fetching shelters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchShelters();
  };

  const handleShelterSelect = (shelter) => {
    setSelectedShelter(shelter);
  };

  if (selectedShelter) {
    return <ShelterDetails shelter={selectedShelter} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder="Enter City, State or Zipcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-2/5 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent transition duration-150 ease-in-out"
          />
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent transition duration-150 ease-in-out appearance-none"
          >
            <option value="">Service Type</option>
            <option value="Shelter">Shelter</option>
            <option value="Foodbank">Foodbank</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-glaucous text-white font-semibold rounded-md shadow-md hover:bg-glaucous/90 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2 transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <ShelterList
          shelters={shelters}
          onShelterSelect={handleShelterSelect}
        />
      )}

      {shelters.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <link className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Previous
            </link>
            <link className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </link>
            <link className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              2
            </link>
            <link className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              3
            </link>
            <link className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Next
            </link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
