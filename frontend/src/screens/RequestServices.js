import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Building2,
  Search,
  Calendar,
  Clock,
  FileText,
  Send,
} from "lucide-react";

const RequestServices = () => {
  const [searchParams] = useSearchParams();
  const shelterId = searchParams.get("shelter");
  const [isLoading, setIsLoading] = useState(true);
  const [shelterName, setShelterName] = useState("");

  // Form state
  const [selectedService, setSelectedService] = useState("");
  const [requestData, setRequestData] = useState({
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  useEffect(() => {
    const fetchShelterDetails = async () => {
      if (!shelterId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/shelters?id=${shelterId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setShelterName(response.data.name);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching shelter details:", error);
        toast.error("Failed to load shelter details");
        setIsLoading(false);
      }
    };

    fetchShelterDetails();
  }, [shelterId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!shelterId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              New Service Request
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No Shelter Selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please search and select a shelter first before requesting
                services
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Go to Shelter Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            New Service Request
          </h2>
          {shelterName && (
            <p className="mt-1 text-sm text-gray-600">
              Requesting services from{" "}
              <span className="font-medium">{shelterName}</span>
            </p>
          )}
        </div>

        <form className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a service</option>
              <option value="food">Food Assistance</option>
              <option value="shelter">Temporary Shelter</option>
              <option value="medical">Medical Care</option>
              <option value="counseling">Counseling</option>
            </select>
          </div>

          {/* Preferred Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={requestData.preferredDate}
                  onChange={(e) =>
                    setRequestData((prev) => ({
                      ...prev,
                      preferredDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={requestData.preferredTime}
                  onChange={(e) =>
                    setRequestData((prev) => ({
                      ...prev,
                      preferredTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Messsage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messsage
            </label>
            <div className="relative">
              <textarea
                value={requestData.notes}
                onChange={(e) =>
                  setRequestData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information about your request..."
              />
              <FileText className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button" // Changed from submit since we're not handling submission yet
              disabled={true} // Disabled for now
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="mr-2 h-5 w-5" />
              Submit Request (Coming Soon)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestServices;
