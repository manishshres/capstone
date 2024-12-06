import React from "react";
import { Building2, Loader2 } from "lucide-react";
import ShelterCard from "./ShelterCard";

const ShelterList = ({
  isLoading,
  error,
  shelters = [],
  userType,
  userId,
  searchType,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!shelters || shelters.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No shelters found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchType
            ? "Try adjusting your search criteria"
            : "Start by searching for shelters in your area"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Optional Results Summary */}
      <div className="text-sm text-gray-600">
        Found {shelters.length} result{shelters.length !== 1 ? "s" : ""}
      </div>

      {/* Shelter Cards */}
      <div className="space-y-6">
        {shelters.map((shelter) => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            userType={userType}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
};

export default ShelterList;
