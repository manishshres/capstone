import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2
} from 'lucide-react';

const CreateVolunteerJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    type: 'oneTime',
    date: '',
    time: '',
    location: '',
    spots: '',
    requirements: '',
    skills: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/organization/volunteer-jobs',
        jobData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Volunteer opportunity posted successfully');
      navigate('/organization/volunteer-jobs');
    } catch (error) {
      toast.error('Failed to post volunteer opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={jobData.title}
              onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={jobData.description}
              onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={jobData.type}
                onChange={(e) => setJobData(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="oneTime">One-time</option>
                <option value="recurring">Recurring</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Available Spots
              </label>
              <input
                type="number"
                min="1"
                value={jobData.spots}
                onChange={(e) => setJobData(prev => ({ ...prev, spots: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={jobData.date}
                onChange={(e) => setJobData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                value={jobData.time}
                onChange={(e) => setJobData(prev => ({ ...prev, time: e.target.value }))}
                className