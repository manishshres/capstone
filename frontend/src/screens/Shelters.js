import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Building2,
  Loader2,
  Phone,
  Globe,
  Mail,
  Clock,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

const Shelters = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShelterDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/organization/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setShelter(response.data);
      } catch (error) {
        console.error("Error fetching shelter details:", error);
        setError("Failed to load shelter details");
        toast.error("Failed to load shelter details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShelterDetails();
  }, [id]);

  const getGoogleMapsUrl = (shelter) => {
    if (shelter.profile.latitude && shelter.profile.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${shelter.profile.latitude},${shelter.profile.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      shelter.profile.full_address
    )}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Search
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {shelter.profile.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600 capitalize">
                Type: {shelter.profile.type || "General Shelter"}
              </p>
            </div>
            {shelter.profile.details_url && (
              <a
                href={shelter.profile.details_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                More Details
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              Location & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600 flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {shelter.profile.full_address}
                    <a
                      href={getGoogleMapsUrl(shelter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline mt-1"
                    >
                      View on Google Maps
                    </a>
                  </span>
                </p>

                {shelter.profile.phone_number && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-gray-400" />
                    <a
                      href={`tel:${shelter.profile.phone_number}`}
                      className="hover:text-blue-600"
                    >
                      {shelter.profile.phone_number}
                    </a>
                  </p>
                )}

                {shelter.profile.website && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-gray-400" />
                    <a
                      href={shelter.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </p>
                )}

                {shelter.profile.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    <a
                      href={`mailto:${shelter.profile.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {shelter.profile.email}
                    </a>
                  </p>
                )}

                {shelter.profile.business_hours && (
                  <p className="text-sm text-gray-600 flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">
                      {shelter.profile.business_hours}
                    </span>
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  About
                </h3>
                <p className="text-sm text-gray-600">
                  {shelter.profile.description || "No description available."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={() =>
                navigate(`/request-services?shelter=${shelter.profile.id}`)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shelters;
