import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Building2,
  Search,
  FileText,
  Send,
  Mail,
  Phone,
} from "lucide-react";

const CreateServiceRequest = () => {
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get("shelter");
  const [isLoading, setIsLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    service: {
      id: "",
      name: "",
      type: "",
    },
    description: "",
    preferredContact: "email",
    contactDetails: {
      email: "",
      phone: "",
    },
  });

  // Validation state
  const isFormValid =
    formData.service.name &&
    formData.description &&
    formData.preferredContact &&
    ((formData.preferredContact === "email" && formData.contactDetails.email) ||
      (formData.preferredContact === "phone" && formData.contactDetails.phone));
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      if (!orgId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/organization/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Raw service data:", response.data.services?.serviceList);
        setOrganization(response.data);
        console.log(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching organization details:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load organization details";
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || !organization?.userId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      console.log(organization?.userId);
      console.log({
        organizationId: organization.userId,
        serviceId: formData.service.id,
        serviceName: formData.service.name,
        serviceType: formData.service.type,
        description: formData.description,
        preferredContact: formData.preferredContact,
        contactDetails: formData.contactDetails,
      });

      await axios.post(
        `/api/support/new-request`,
        {
          organizationId: organization.userId,
          serviceId: formData.service.id,
          serviceName: formData.service.name,
          serviceType: formData.service.type,
          description: formData.description,
          preferredContact: formData.preferredContact,
          contactDetails: formData.contactDetails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Service request submitted successfully");
      // Reset form
      setFormData({
        service: {
          id: "",
          name: "",
          type: "",
        },
        description: "",
        preferredContact: "email",
        contactDetails: {
          email: "",
          phone: "",
        },
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit service request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelection = (e) => {
    const selectedService = formattedServices.find(
      (service) => service.value === e.target.value
    );

    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        service: {
          id: selectedService.id,
          name: selectedService.name,
          type: selectedService.type || "",
        },
      }));
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!orgId) {
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
                No Organization Selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please search and select an organization first before requesting
                services
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Go to Organization Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const serviceList = organization?.services?.serviceList || [];
  const formattedServices = serviceList.map((service) => {
    if (typeof service === "object") {
      return {
        id: service.id,
        name: service.name,
        value: service.name,
        type: service.type,
      };
    }
    return {
      id: service,
      name: service,
      value: service,
      type: service,
    };
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            New Service Request
          </h2>
          {organization?.profile?.name && (
            <p className="mt-1 text-sm text-gray-700">
              Requesting services from{" "}
              <span className="font-medium text-gray-700">
                {organization.profile.name}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={formData.service.name}
              onChange={handleServiceSelection}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a service</option>
              {formattedServices.map((service) => (
                <option key={service.id} value={service.value}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContact: "email",
                  }))
                }
                className={`p-3 border rounded-md flex items-center justify-center gap-2 ${
                  formData.preferredContact === "email"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Mail className="h-5 w-5" />
                Email
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContact: "phone",
                  }))
                }
                className={`p-3 border rounded-md flex items-center justify-center gap-2 ${
                  formData.preferredContact === "phone"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Phone className="h-5 w-5" />
                Phone
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Details
            </label>
            {formData.preferredContact === "email" ? (
              <input
                type="email"
                value={formData.contactDetails.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactDetails: {
                      ...prev.contactDetails,
                      email: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
                required
              />
            ) : (
              <input
                type="tel"
                value={formData.contactDetails.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactDetails: {
                      ...prev.contactDetails,
                      phone: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                required
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe what you need help with..."
                required
              />
              <FileText className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceRequest;
