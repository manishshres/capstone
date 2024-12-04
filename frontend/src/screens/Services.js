import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, Plus, Pencil, Trash2, Save, X, Info } from "lucide-react";

const SERVICE_TYPES = [
  { value: "shelter", label: "Shelter Services" },
  { value: "food", label: "Food Services" },
  { value: "health", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "employment", label: "Employment" },
  { value: "counseling", label: "Counseling" },
  { value: "legal", label: "Legal Aid" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

const Services = () => {
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    type: "",
    description: "",
    availability: "always",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/organization/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle both object and string array formats
      const serviceList = response.data.serviceList || [];
      const formattedServices = serviceList.map((service) => {
        if (typeof service === "string") {
          return {
            name: service,
            type: "other",
            description: "",
            availability: "always",
            id: Date.now() + Math.random(),
          };
        }
        return service;
      });

      setDescription(response.data.description || "");
      setServices(formattedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateService = (service) => {
    const newErrors = {};
    if (!service.name.trim()) newErrors.name = "Service name is required";
    if (!service.type) newErrors.type = "Service type is required";
    if (service.name.length > 100) newErrors.name = "Service name is too long";
    return newErrors;
  };

  const handleAddService = () => {
    const validationErrors = validateService(newService);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setServices([...services, { ...newService, id: Date.now() }]);
    setNewService({
      name: "",
      type: "",
      description: "",
      availability: "always",
    });
    setErrors({});
    setHasChanges(true);
  };

  const handleEditService = (index) => {
    setEditingIndex(index);
    setNewService(services[index]);
  };

  const handleUpdateService = (index) => {
    const validationErrors = validateService(newService);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedServices = [...services];
    updatedServices[index] = { ...newService, id: services[index].id };
    setServices(updatedServices);
    setEditingIndex(null);
    setNewService({
      name: "",
      type: "",
      description: "",
      availability: "always",
    });
    setErrors({});
    setHasChanges(true);
  };

  const handleDeleteService = (index) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const updatedServices = services.filter((_, i) => i !== index);
      setServices(updatedServices);
      setHasChanges(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      // Format services for backend
      const serviceList = services.map((service) => service.name);

      await axios.put(
        "/api/organization/services",
        {
          description,
          serviceList: services,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Services updated successfully.");
      setHasChanges(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update services. Please try again.");
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Services Management
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage the services your organization provides
              </p>
            </div>
            {hasChanges && (
              <div className="text-sm text-amber-600 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Describe your organization and the types of services you provide..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Service
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name*
                  </label>
                  <input
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    type="text"
                    placeholder="Enter service name"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type*
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    }`}
                    value={newService.type}
                    onChange={(e) =>
                      setNewService({ ...newService, type: e.target.value })
                    }
                  >
                    <option value="">Select type...</option>
                    {SERVICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Describe this service..."
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  {editingIndex !== null ? (
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(null);
                          setNewService({
                            name: "",
                            type: "",
                            description: "",
                            availability: "always",
                          });
                          setErrors({});
                        }}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateService(editingIndex)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                      >
                        <Save className="h-5 w-5 mr-1" />
                        Update Service
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-1" />
                      Add Service
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Services List
              </h3>
              <div className="space-y-3">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No services added yet. Add your first service above.
                  </div>
                ) : (
                  services.map((service, index) => (
                    <div
                      key={service.id || index}
                      className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors duration-150"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {service.name}
                          </h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {SERVICE_TYPES.find((t) => t.value === service.type)
                              ?.label || service.type}
                          </span>
                        </div>
                        {service.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditService(index)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-md"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(index)}
                          className="p-2 text-gray-500 hover:text-red-600 rounded-md"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Saving Changes...
                  </>
                ) : (
                  "Save All Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Services;
