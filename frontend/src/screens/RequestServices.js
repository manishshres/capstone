import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, CheckCircle2 } from "lucide-react";

const RequestServices = () => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/organization/services",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setServices(response.data.serviceList || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load available services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      }
      return [...prev, service];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/user/service-requests",
        {
          services: selectedServices,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Service requests submitted successfully.");
      setSelectedServices([]); // Reset selection after successful submission
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit service requests. Please try again.");
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
            Request Services
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Select the services you would like to request
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  onClick={() => handleServiceToggle(service)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${
                      selectedServices.includes(service)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{service}</span>
                    {selectedServices.includes(service) && (
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No services are currently available.
              </div>
            )}

            {services.length > 0 && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving || selectedServices.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestServices;
