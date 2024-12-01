import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Loader2,
  Clock,
  Filter,
  MessageSquare,
  X,
  Check,
  Eye,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { AuthContext } from "../contexts/AuthContext";

// Constants
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// API client with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ViewServiceRequest = () => {
  const { authState } = useContext(AuthContext);
  const isOrganization = authState.user?.accountType === "org";

  // State
  const [state, setState] = useState({
    requests: [],
    isLoading: true,
    statusFilter: "all",
    selectedRequest: null,
    detailedRequest: null,
    viewMode: false,
    isSubmitting: false,
  });

  const [formData, setFormData] = useState({
    editDescription: "",
    responseData: {
      status: "pending",
      response: "",
      additionalNotes: "",
    },
  });

  // Callbacks and Effects
  const handleResponseChange = useCallback((e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      responseData: {
        ...prev.responseData,
        response: value,
      },
    }));
  }, []);

  const handleNotesChange = useCallback((e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      responseData: {
        ...prev.responseData,
        additionalNotes: value,
      },
    }));
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/support/requests");
      setState((prev) => ({
        ...prev,
        requests: response.data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load service requests");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleUpdateRequest = useCallback(
    async (requestId, updateData) => {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        await apiClient.put(`/api/support/request/${requestId}`, updateData);
        toast.success("Request updated successfully");
        setState((prev) => ({ ...prev, selectedRequest: null }));
        setFormData((prev) => ({
          ...prev,
          editDescription: "",
        }));
        await fetchRequests();
      } catch (error) {
        console.error("Error updating request:", error);
        toast.error(
          error.response?.data?.message || "Failed to update request"
        );
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [fetchRequests]
  );

  const handleOrgResponse = useCallback(
    async (requestId, responseData) => {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        await apiClient.put(`/api/support/respond/${requestId}`, responseData);
        toast.success("Response submitted successfully");
        setState((prev) => ({
          ...prev,
          selectedRequest: null,
          isSubmitting: false,
        }));
        setFormData((prev) => ({
          ...prev,
          responseData: {
            status: "pending",
            response: "",
            additionalNotes: "",
          },
        }));
        await fetchRequests();
      } catch (error) {
        console.error("Error submitting response:", error);
        toast.error(
          error.response?.data?.message || "Failed to submit response"
        );
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [fetchRequests]
  );

  const fetchRequestDetails = useCallback(async (requestId) => {
    try {
      const response = await apiClient.get(`/api/support/${requestId}`);
      setState((prev) => ({
        ...prev,
        detailedRequest: response.data,
        viewMode: true,
      }));
    } catch (error) {
      console.error("Error fetching request details:", error);
      toast.error("Failed to load request details");
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return state.requests.filter((request) =>
      state.statusFilter === "all"
        ? true
        : request.status === state.statusFilter
    );
  }, [state.requests, state.statusFilter]);

  // Action Handlers
  const handleEditClick = useCallback((request) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
    }));
    setFormData((prev) => ({
      ...prev,
      editDescription: request.description,
    }));
  }, []);

  const handleResponseClick = useCallback((request) => {
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
    }));
    setFormData((prev) => ({
      ...prev,
      responseData: {
        status: request.status,
        response: "",
        additionalNotes: "",
      },
    }));
  }, []);

  // Table Action Buttons
  const TableActions = ({ request }) => {
    if (isOrganization) {
      return (
        <div className="flex space-x-2">
          {(request.status === "pending" ||
            request.status === "in-progress") && (
            <button
              onClick={() => handleResponseClick(request)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Respond
            </button>
          )}
          <button
            onClick={() => fetchRequestDetails(request._id)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        {request.status === "pending" && (
          <button
            onClick={() => handleEditClick(request)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </button>
        )}
        <button
          onClick={() => fetchRequestDetails(request._id)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-600 hover:bg-blue-700"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    );
  };

  // Modals
  const ViewDetailsModal = () => (
    <Modal
      isOpen={state.viewMode}
      onClose={() =>
        setState((prev) => ({
          ...prev,
          viewMode: false,
          detailedRequest: null,
        }))
      }
      title="Request Details"
    >
      {state.detailedRequest && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Service Name</p>
              <p className="mt-1">{state.detailedRequest.serviceName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Service Type</p>
              <p className="mt-1">{state.detailedRequest.serviceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge status={state.detailedRequest.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1">
                {format(
                  new Date(state.detailedRequest.createdAt),
                  "MMM d, yyyy h:mm a"
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{state.detailedRequest.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Contact Details</p>
            <div className="mt-1">
              {state.detailedRequest.contactDetails.email && (
                <p>Email: {state.detailedRequest.contactDetails.email}</p>
              )}
              {state.detailedRequest.contactDetails.phone && (
                <p>Phone: {state.detailedRequest.contactDetails.phone}</p>
              )}
            </div>
          </div>

          {state.detailedRequest.responseData && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Response</p>
                <p className="mt-1">
                  {state.detailedRequest.responseData.response}
                </p>
              </div>
              {state.detailedRequest.responseData.additionalNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Additional Notes
                  </p>
                  <p className="mt-1">
                    {state.detailedRequest.responseData.additionalNotes}
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">History</p>
            <div className="mt-2 space-y-2">
              {state.detailedRequest.history.map((item, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">
                    {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
                  </p>
                  <p>Status: {item.status}</p>
                  <p>Note: {item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  const EditModal = () => (
    <Modal
      isOpen={!!state.selectedRequest}
      onClose={() => {
        setState((prev) => ({ ...prev, selectedRequest: null }));
        setFormData((prev) => ({
          ...prev,
          editDescription: "",
          responseData: {
            status: "pending",
            response: "",
            additionalNotes: "",
          },
        }));
      }}
      title={isOrganization ? "Respond to Request" : "Edit Request"}
    >
      {isOrganization ? (
        <div className="space-y-6">
          {/* Organization response form content */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Update Status
              </label>
              <select
                value={formData.responseData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    responseData: {
                      ...prev.responseData,
                      status: e.target.value,
                    },
                  }))
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Response Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.responseData.response}
                onChange={handleResponseChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter your response..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                value={formData.responseData.additionalNotes}
                onChange={handleNotesChange}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Internal notes..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.editDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                editDescription: e.target.value,
              }))
            }
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Update your request description..."
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={() =>
            setState((prev) => ({ ...prev, selectedRequest: null }))
          }
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (isOrganization) {
              handleOrgResponse(
                state.selectedRequest._id,
                formData.responseData
              );
            } else {
              handleUpdateRequest(state.selectedRequest._id, {
                description: formData.editDescription,
              });
            }
          }}
          disabled={
            state.isSubmitting ||
            (isOrganization
              ? !formData.responseData.response
              : !formData.editDescription)
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {state.isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {isOrganization ? "Submit Response" : "Update Request"}
            </>
          )}
        </button>
      </div>
    </Modal>
  );

  // Main Component Render
  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Service Requests
            </h2>
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={state.statusFilter}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    statusFilter: e.target.value,
                  }))
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.serviceName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Type: {request.serviceType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.preferredContact === "email" ? (
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {request.contactDetails.email}
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {request.contactDetails.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {request.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(request.createdAt), "h:mm a")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TableActions request={request} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {state.statusFilter === "all"
                ? "You haven't made any service requests yet."
                : `No ${state.statusFilter} requests found.`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {state.selectedRequest && <EditModal />}
      {state.viewMode && <ViewDetailsModal />}
    </div>
  );
};

export default ViewServiceRequest;
