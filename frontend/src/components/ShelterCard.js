import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Globe, Star, Clock, Info, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const ShelterCard = ({ shelter, userType, userId }) => {
  const navigate = useNavigate();
  const [shelterRating, setShelterRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("token");
      const [averageResponse, userRatingResponse] = await Promise.all([
        axios.get(`/api/rating/org/${shelter.id}/average`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/rating/org/${shelter.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setShelterRating(averageResponse.data);
      const userRating = userRatingResponse.data.find(
        (rating) => rating.userId === userId
      );
      setUserRating(userRating);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleRatingSubmit = async (rating) => {
    try {
      setIsSubmittingRating(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/rating/${shelter.id}`,
        {
          organizationId: shelter.id,
          rating,
          comment: "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Rating submitted successfully");
      const averageResponse = await axios.get(
        `/api/rating/org/${shelter.id}/average`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShelterRating(averageResponse.data);
      setUserRating({ rating });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error.response?.data?.error || "Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatBusinessHours = (hours) => {
    // Check if hours exists and is a string
    if (!hours || typeof hours !== "string") {
      return "Hours not available";
    }

    // Try to parse if it's a stringified object
    try {
      if (hours.startsWith("{")) {
        const parsedHours = JSON.parse(hours);
        return Object.entries(parsedHours).map(([day, time]) => (
          <div key={day} className="text-sm">
            {day}: {time}
          </div>
        ));
      }

      // Handle regular string format
      return hours.split("\n").map((line, index) => (
        <div key={index} className="text-sm">
          {line}
        </div>
      ));
    } catch (error) {
      console.error("Error formatting hours:", error);
      return hours || "Hours not available";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {shelter.name}
            </h3>
            {shelter.type && (
              <p className="text-sm text-gray-500 mt-1">
                {shelter.type.charAt(0).toUpperCase() + shelter.type.slice(1)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {shelterRating && (
              <div className="flex items-center text-sm text-gray-600">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-4 w-4 ${
                      rating <= shelterRating.averageRating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-1">({shelterRating.totalRatings})</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Score */}
        {shelter.matchScore && (
          <div className="mt-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Match Score: {shelter.matchScore}%
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {showMore
              ? shelter.description
              : `${shelter.description?.slice(0, 150)}...`}
            {shelter.description?.length > 150 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            )}
          </p>
        </div>

        {/* Contact Information */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {shelter.formattedAddress || shelter.full_address}
          </p>

          {shelter.contactInfo?.phone && (
            <p className="text-sm text-gray-600 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <a
                href={`tel:${shelter.contactInfo.phone}`}
                className="hover:text-blue-600"
              >
                {shelter.contactInfo.phone}
              </a>
            </p>
          )}

          {shelter.contactInfo?.website && (
            <p className="text-sm text-gray-600 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <a
                href={shelter.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </p>
          )}

          {shelter.business_hours && (
            <div className="text-sm text-gray-600 flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-1" />
              <div>
                {typeof shelter.business_hours === "object"
                  ? Object.entries(shelter.business_hours).map(
                      ([day, time]) => (
                        <div key={day} className="text-sm">
                          {day}: {time}
                        </div>
                      )
                    )
                  : formatBusinessHours(shelter.business_hours)}
              </div>
            </div>
          )}
        </div>

        {/* Services */}
        {shelter.serviceDetails?.type && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {shelter.serviceDetails.type.split(",").map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {service.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User Rating Section */}
        {userType === "user" && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingSubmit(rating)}
                disabled={isSubmittingRating}
                className={`p-1 ${
                  isSubmittingRating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <Star
                  className={`h-5 w-5 transition-colors duration-150 ${
                    rating <= (userRating?.rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                />
              </button>
            ))}
            {isSubmittingRating && (
              <span className="ml-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin inline-block" />
              </span>
            )}
          </div>
        )}
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          {userType === "user" && (
            <button
              onClick={() =>
                navigate(`/create-request-services?shelter=${shelter.id}`)
              }
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Service
            </button>
          )}
          <button
            onClick={() => navigate(`/shelters/${shelter.id}`)}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelterCard;
