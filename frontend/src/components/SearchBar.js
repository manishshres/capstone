import React from "react";
import { MapPin, Building2, Navigation, Search, Loader2 } from "lucide-react";
import { US_STATES } from "../lib/states";

const SearchTypes = {
  ZIPCODE: "zipcode",
  CITY_STATE: "cityState",
  LOCATION: "location",
};

const SearchBar = ({
  searchType,
  setSearchType,
  searchData,
  setSearchData,
  isLoading,
  error,
  onSearch,
  onClear,
  handleUseCurrentLocation,
  sheltersFound,
}) => {
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  // Render search input based on type
  const renderSearchInput = () => {
    switch (searchType) {
      case SearchTypes.ZIPCODE:
        return (
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
        );

      case SearchTypes.CITY_STATE:
        return (
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
        );

      case SearchTypes.LOCATION:
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 border-b border-gray-200">
      {/* Search Type Selector */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setSearchType(SearchTypes.ZIPCODE)}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              searchType === SearchTypes.ZIPCODE
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Search by ZIP
          </button>
          <button
            type="button"
            onClick={() => setSearchType(SearchTypes.CITY_STATE)}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              searchType === SearchTypes.CITY_STATE
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Search by City/State
          </button>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className={`px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
              searchType === SearchTypes.LOCATION
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Use Current Location
          </button>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderSearchInput()}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end space-x-4">
          {sheltersFound > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Clear Search
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
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
  );
};

export default SearchBar;
