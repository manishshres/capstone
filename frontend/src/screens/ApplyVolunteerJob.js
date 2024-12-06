import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, ArrowLeft } from "lucide-react";

const ApplyVolunteerJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    motivationLetter: "",
    availability: "",
    experience: "",
    skills: [],
    comments: "",
  });

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/volunteer/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJob(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to fetch job details");
      navigate("/volunteer/jobs");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setApplicationData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/volunteer/jobs/${jobId}/apply`,
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        toast.success("Application submitted successfully");
        navigate("/volunteer/applications");
      }
    } catch (error) {
      console.error("Application error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to submit application";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate("/volunteer/jobs")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Opportunities
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            Apply for: {job.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Please fill out the application form below
          </p>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1">
                {job.location.name}
                <br />
                {job.location.address}
                <br />
                {job.location.city}, {job.location.state} {job.location.zipCode}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Schedule</h3>
              <p className="mt-1">
                Date: {new Date(job.date).toLocaleDateString()}
                <br />
                Time: {job.startTime} - {job.endTime}
                <br />
                Available Spots: {job.spots.available}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Motivation Letter*
            </label>
            <textarea
              name="motivationLetter"
              value={applicationData.motivationLetter}
              onChange={handleInputChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="Why are you interested in this opportunity?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Availability*
            </label>
            <textarea
              name="availability"
              value={applicationData.availability}
              onChange={handleInputChange}
              required
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="What days and times are you available?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relevant Experience*
            </label>
            <textarea
              name="experience"
              value={applicationData.experience}
              onChange={handleInputChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="Describe any relevant experience for this role"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relevant Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={applicationData.skills.join(", ")}
              onChange={handleSkillsChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="e.g. communication, teamwork, leadership"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Comments
            </label>
            <textarea
              name="comments"
              value={applicationData.comments}
              onChange={handleInputChange}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="Any additional information you'd like to share"
            />
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyVolunteerJob;
