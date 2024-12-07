import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import SearchBar from "../components/SearchBar";
import ShelterList from "../components/Shelter/ShelterList";
import FilterSection from "../components/Filters/FilterSection";
import { applyFilters } from "../lib/filterUtils";

const STORAGE_KEY = "dashboard_search_state";

const SearchTypes = {
  ZIPCODE: "zipcode",
  CITY_STATE: "cityState",
  LOCATION: "location",
};

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
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

    return saved ? JSON.parse(saved) : defaultData;
  });

  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const [filters, setFilters] = useState({
    type: "",
    distance: "5",
    availability: "",
    minMatchScore: 0,
    minRating: 0,
  });

  const filteredShelters = applyFilters(shelters, filters);
  console.log(filteredShelters);

  // Get user's location on mount
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

  // Validate search input
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

  // Fetch shelters
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

      setShelters(response.data.results || []);
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
      setShelters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle using current location
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

  // Clear search
  const handleClearSearch = () => {
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Find Shelters & Services
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Search for shelters and services in your area
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchType={searchType}
        setSearchType={setSearchType}
        searchData={searchData}
        setSearchData={setSearchData}
        isLoading={isLoading}
        error={error}
        onSearch={fetchShelters}
        onClear={handleClearSearch}
        handleUseCurrentLocation={handleUseCurrentLocation}
        sheltersFound={shelters.length}
      />

      <div className="mt-6 flex gap-6">
        {/* Filters - Left Side */}
        <div className="w-64 flex-shrink-0">
          <FilterSection filters={filters} setFilters={setFilters} />
        </div>

        {/* Results - Right Side */}
        <div className="flex-grow">
          <ShelterList
            shelters={filteredShelters}
            isLoading={isLoading}
            error={error}
            userType={authState.user?.accountType}
            userId={authState.user?.id}
            searchType={searchType}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
