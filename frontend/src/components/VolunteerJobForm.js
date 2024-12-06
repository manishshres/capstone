import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const defaultFormData = {
  title: "",
  description: "",
  type: "",
  date: "",
  startTime: "",
  endTime: "",
  location: {
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  },
  spots: 0,
  requirements: "",
  benefits: "",
  skills: [],
  responsibilities: [],
  schedule: {
    frequency: "oneTime",
    days: [],
    duration: "",
  },
  contact: {
    name: "",
    email: "",
    phone: "",
  },
};

const VolunteerJobForm = ({ mode = "create" }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (mode === "edit" && jobId) {
      fetchJobDetails();
    }
  }, [jobId, mode]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/volunteer/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const job = response.data;
      setFormData({
        title: job.title,
        description: job.description,
        type: job.type,
        date: job.date ? job.date.split("T")[0] : "",
        startTime: job.startTime,
        endTime: job.endTime,
        location: job.location,
        spots: job.spots.total,
        requirements: job.requirements,
        benefits: job.benefits,
        skills: job.skills,
        responsibilities: job.responsibilities,
        schedule: job.schedule,
        contact: job.contact,
      });
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to fetch job details");
      navigate("/volunteer/jobs");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameParts = name.split(".");

    if (nameParts.length === 2) {
      const [parent, child] = nameParts;
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayInput = (e, field) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleDays = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (mode === "edit") {
        await axios.put(`/api/volunteer/jobs/${jobId}`, formData, { headers });
        toast.success("Job updated successfully");
      } else {
        await axios.post("/api/volunteer/jobs", formData, { headers });
        toast.success("Job created successfully");
      }

      navigate("/volunteer/jobs");
    } catch (error) {
      toast.error(
        mode === "edit" ? "Failed to update job" : "Failed to create job"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            {mode === "edit"
              ? "Edit Volunteer Opportunity"
              : "Create Volunteer Opportunity"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">Select Type</option>
                <option value="education">Education</option>
                <option value="community">Community</option>
                <option value="health">Health</option>
                <option value="environment">Environment</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location Name
              </label>
              <input
                type="text"
                name="location.name"
                value={formData.location.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Spots and Requirements */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Spots
              </label>
              <input
                type="number"
                name="spots"
                value={formData.spots}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          {/* Skills and Responsibilities */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills.join(", ")}
                onChange={(e) => handleArrayInput(e, "skills")}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Example: communication, teamwork, leadership"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Responsibilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.responsibilities.join(", ")}
                onChange={(e) => handleArrayInput(e, "responsibilities")}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Example: mentor students, organize activities"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                name="schedule.frequency"
                value={formData.schedule.frequency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="oneTime">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="asNeeded">As Needed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Days Available
              </label>
              <select
                multiple
                name="schedule.days"
                value={formData.schedule.days}
                onChange={handleScheduleDays}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                size={7}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <input
                type="text"
                name="schedule.duration"
                value={formData.schedule.duration}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Example: 3 months, ongoing, etc."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <input
                type="text"
                name="contact.name"
                value={formData.contact.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/volunteer/jobs")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving && (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              )}
              {isSaving
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Create Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerJobForm;
