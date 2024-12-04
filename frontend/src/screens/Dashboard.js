import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Building2,
  Loader2,
  Search,
  Phone,
  Globe,
  Navigation,
  Star,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { US_STATES } from "lib/states";

const STORAGE_KEY = "dashboard_search_state";

const SearchTypes = {
  ZIPCODE: "zipcode",
  CITY_STATE: "cityState",
  LOCATION: "location",
};

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchType, setSearchType] = useState(() => {
    return searchParams.get("searchType") || SearchTypes.ZIPCODE;
  });

  const [searchData, setSearchData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultData = {
      zipcode: "",
      city: "",
      state: "",
      lat: "",
      lng: "",
    };

    if (saved) {
      return JSON.parse(saved);
    }

    return defaultData;
  });

  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Get user's location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const validateSearch = () => {
    setError("");

    switch (searchType) {
      case SearchTypes.ZIPCODE:
        if (!/^\d{5}$/.test(searchData.zipcode)) {
          setError("Please enter a valid 5-digit ZIP code");
          return false;
        }
        break;

      case SearchTypes.CITY_STATE:
        if (!searchData.city || !searchData.state) {
          setError("Please enter both city and state");
          return false;
        }
        break;

      case SearchTypes.LOCATION:
        if (!searchData.lat || !searchData.lng) {
          setError("Location coordinates are required");
          return false;
        }
        break;
    }

    return true;
  };

  const fetchShelters = async () => {
    if (!validateSearch()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let searchParam = "";

      switch (searchType) {
        case SearchTypes.ZIPCODE:
          searchParam = searchData.zipcode;
          break;
        case SearchTypes.CITY_STATE:
          searchParam = `${searchData.city}, ${searchData.state}`;
          break;
        case SearchTypes.LOCATION:
          searchParam = `${searchData.lat},${searchData.lng}`;
          break;
      }

      const response = await axios.get(
        `/api/shelters?search=${encodeURIComponent(searchParam)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShelters(response.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchData));
      setSearchParams({
        searchType,
        search: searchParam,
      });
    } catch (error) {
      console.error("Error fetching shelters:", error);
      if (error.response?.status === 400) {
        setError(error.response.data.error);
      } else {
        toast.error("Failed to load shelters");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSearchType(SearchTypes.LOCATION);
      setSearchData((prev) => ({
        ...prev,
        lat: userLocation.lat.toFixed(6),
        lng: userLocation.lng.toFixed(6),
      }));
    } else {
      toast.error("Unable to get your current location");
    }
  };

  const clearSearch = () => {
    setSearchData({
      zipcode: "",
      city: "",
      state: "",
      lat: "",
      lng: "",
    });
    setShelters([]);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            Find Shelters Near You
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Search by ZIP code, city and state, or use your current location
          </p>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchType(SearchTypes.ZIPCODE)}
                className={`px-4 py-2 rounded-md ${
                  searchType === SearchTypes.ZIPCODE
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                ZIP Code
              </button>
              <button
                onClick={() => setSearchType(SearchTypes.CITY_STATE)}
                className={`px-4 py-2 rounded-md ${
                  searchType === SearchTypes.CITY_STATE
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                City & State
              </button>
              <button
                onClick={handleUseCurrentLocation}
                className={`px-4 py-2 rounded-md flex items-center ${
                  searchType === SearchTypes.LOCATION
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Current Location
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchShelters();
            }}
            className="space-y-4"
          >
            {searchType === SearchTypes.ZIPCODE && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter ZIP code (e.g., 12345)"
                  value={searchData.zipcode}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      zipcode: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={5}
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            )}

            {searchType === SearchTypes.CITY_STATE && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={searchData.city}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                  <select
                    value={searchData.state}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {searchType === SearchTypes.LOCATION && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={searchData.lat}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        lat: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                  <Navigation className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={searchData.lng}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        lng: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                  <Navigation className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end space-x-4">
              {(shelters.length > 0 || error) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Clear Search
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-red-500">{error}</p>
            </div>
          ) : Array.isArray(shelters) && shelters.length > 0 ? (
            <div className="space-y-6">
              {shelters.map((shelter) => {
                const ShelterCard = () => {
                  console.log(shelter);
                  const [shelterRating, setShelterRating] = useState(null);
                  const [userRating, setUserRating] = useState(null);
                  const [isSubmittingRating, setIsSubmittingRating] =
                    useState(false);

                  useEffect(() => {
                    const fetchRatings = async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const [averageResponse, ratingsResponse] =
                          await Promise.all([
                            axios.get(`/api/rating/org/${shelter.id}/average`, {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                            axios.get(`/api/rating/org/${shelter.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            }),
                          ]);

                        setShelterRating(averageResponse.data);
                        const userRating = ratingsResponse.data.find(
                          (rating) => rating.userId === authState.user?.id
                        );
                        setUserRating(userRating);
                      } catch (error) {
                        console.error("Error fetching ratings:", error);
                      }
                    };

                    fetchRatings();
                  }, []);

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
                      toast.error(
                        error.response?.data?.error || "Failed to submit rating"
                      );
                    } finally {
                      setIsSubmittingRating(false);
                    }
                  };

                  return (
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors duration-150">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">
                          {shelter.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {shelterRating && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                              <span>{shelterRating.averageRating}</span>
                              <span className="text-gray-400 ml-1">
                                ({shelterRating.totalRatings})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {shelter.address}
                        </p>

                        {shelter.phone && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {shelter.phone}
                          </p>
                        )}

                        {shelter.website && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            <a
                              href={shelter.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </p>
                        )}

                        {authState.user?.accountType === "user" && (
                          <div className="flex items-center mt-2">
                            <span className="text-sm text-gray-600 mr-2">
                              Rate:
                            </span>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleRatingSubmit(rating)}
                                disabled={isSubmittingRating}
                                className={`p-1 ${
                                  userRating?.rating === rating
                                    ? "text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-400"
                                }`}
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    userRating?.rating >= rating
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end space-x-4">
                        {authState.user?.accountType === "user" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/create-request-services?shelter=${shelter.id}`
                              )
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
                  );
                };

                return <ShelterCard key={shelter.id} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No shelters found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try searching in a different location
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
