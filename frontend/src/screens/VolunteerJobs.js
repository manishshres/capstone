import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  Plus,
  X,
  Building2,
} from "lucide-react";

const SKILL_OPTIONS = [
  "Communication",
  "Leadership",
  "Organization",
  "Customer Service",
  "Time Management",
  "Problem Solving",
  "Teamwork",
  "Computer Skills",
  "First Aid",
  "Teaching",
  "Administrative",
  "Event Planning",
  "Social Media",
  "Foreign Language",
  "Cooking",
  "Driving",
];

const CreateVolunteerJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    type: "oneTime",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    spots: "",
    requirements: "",
    benefits: "",
    skills: [],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!jobData.title.trim()) newErrors.title = "Title is required";
    if (!jobData.description.trim())
      newErrors.description = "Description is required";
    if (!jobData.date) newErrors.date = "Date is required";
    if (!jobData.startTime) newErrors.startTime = "Start time is required";
    if (!jobData.endTime) newErrors.endTime = "End time is required";
    if (!jobData.location.trim()) newErrors.location = "Location is required";
    if (!jobData.spots) newErrors.spots = "Number of spots is required";
    if (parseInt(jobData.spots) < 1)
      newErrors.spots = "Must have at least 1 spot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = {
        ...jobData,
        skills: selectedSkills,
      };

      await axios.post(
        "http://localhost:3000/api/organization/volunteer-jobs",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Volunteer opportunity posted successfully");
      navigate("/organization/volunteer-jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(
        error.response?.data?.message || "Failed to post volunteer opportunity"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleAddCustomSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills([...selectedSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            Post Volunteer Opportunity
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new volunteer position for your organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) =>
                  setJobData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`mt-1 w-full px-4 py-2 border rounded-md ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Community Garden Volunteer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobData.description}
                onChange={(e) =>
                  setJobData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className={`mt-1 w-full px-4 py-2 border rounded-md ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe the volunteer opportunity..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Schedule and Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Schedule and Capacity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobData.type}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="oneTime">One-time</option>
                  <option value="recurring">Recurring</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Spots <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={jobData.spots}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, spots: e.target.value }))
                  }
                  className={`mt-1 w-full px-4 py-2 border rounded-md ${
                    errors.spots ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.spots && (
                  <p className="mt-1 text-sm text-red-500">{errors.spots}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={jobData.date}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className={`mt-1 w-full px-4 py-2 border rounded-md ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jobData.startTime}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className={`mt-1 w-full px-4 py-2 border rounded-md ${
                      errors.startTime ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={jobData.endTime}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className={`mt-1 w-full px-4 py-2 border rounded-md ${
                      errors.endTime ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) =>
                    setJobData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className={`mt-1 w-full px-4 py-2 border rounded-md ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Community Center"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  value={jobData.address}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={jobData.city}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={jobData.zipCode}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, zipCode: e.target.value }))
                  }
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Skills and Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Skills and Requirements
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Skills
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a skill</option>
                    {SKILL_OPTIONS.filter(
                      (skill) => !selectedSkills.includes(skill)
                    ).map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleSkillSelect(newSkill)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Or type a custom skill"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Custom
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <textarea
                value={jobData.requirements}
                onChange={(e) =>
                  setJobData((prev) => ({
                    ...prev,
                    requirements: e.target.value,
                  }))
                }
                rows={3}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="List any specific requirements or qualifications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Benefits
              </label>
              <textarea
                value={jobData.benefits}
                onChange={(e) =>
                  setJobData((prev) => ({ ...prev, benefits: e.target.value }))
                }
                rows={3}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Describe any benefits or perks for volunteers..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/organization/volunteer-jobs")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Posting...
                  </>
                ) : (
                  "Post Opportunity"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal - Optional Feature */}
      {/* You can add a preview modal here to show how the job posting will look */}
    </div>
  );
};

export default CreateVolunteerJob;
