import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Building2,
  Calendar,
  Clock,
  FileText,
  Send,
} from "lucide-react";

const RequestServices = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [requestData, setRequestData] = useState({
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/organizations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrganizations(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to load organizations");
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      if (selectedOrg) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:3000/api/organization/${selectedOrg}/services`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setServices(response.data.serviceList || []);
        } catch (error) {
          console.error("Error fetching services:", error);
          toast.error("Failed to load services for selected organization");
        }
      }
    };

    fetchServices();
  }, [selectedOrg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrg || !selectedService) {
      toast.error("Please select an organization and service");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/organization/request",
        {
          organizationId: selectedOrg,
          serviceId: selectedService,
          ...requestData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Service request submitted successfully");
      // Reset form
      setSelectedService("");
      setRequestData({
        preferredDate: "",
        preferredTime: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit service request");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
          <p className="mt-1 text-sm text-gray-600">
            Submit a new service request to an organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organization Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <div className="relative">
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Service Selection */}
          {selectedOrg && (
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
                {services.map((service, index) => (
                  <option key={index} value={service.id}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
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
              type="submit"
              disabled={isSaving || !selectedOrg || !selectedService}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestServices;
