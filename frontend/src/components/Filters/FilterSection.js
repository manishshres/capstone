// components/Filters/FilterSection.jsx
import React from "react";
import { Filter } from "lucide-react";
import FilterItem from "./FilterItem";
import RatingFilter from "./RatingFilter";
import ActiveFilters from "./ActiveFilters";

const serviceTypeOptions = [
  { value: "", label: "All Types" },
  { value: "foodbank", label: "Food Bank" },
  { value: "shelter", label: "Shelter" },
];

const distanceOptions = [
  { value: "1", label: "Within 1 miles" },
  { value: "2", label: "Within 2 miles" },
  { value: "5", label: "Within 5 miles" },
  { value: "10", label: "Within 10 miles" },
];
const availabilityOptions = [
  { value: "", label: "Any" },
  { value: "open", label: "Currently Open" },
  { value: "closed", label: "Closed" },
];

const FilterSection = ({ filters, setFilters }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      <div className="space-y-4">
        <FilterItem
          label="Service Type"
          value={filters.type}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, type: e.target.value }))
          }
          options={serviceTypeOptions}
        />

        <FilterItem
          label="Availability"
          value={filters.availability}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, availability: e.target.value }))
          }
          options={availabilityOptions}
        />
        <FilterItem
          label="Distance"
          value={filters.distance}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, distance: e.target.value }))
          }
          options={distanceOptions}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Match Score
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minMatchScore || 0}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minMatchScore: Number(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">
            {filters.minMatchScore || 0}%
          </div>
        </div>

        <RatingFilter
          value={filters.minRating}
          onChange={(rating) =>
            setFilters((prev) => ({ ...prev, minRating: rating }))
          }
        />

        <ActiveFilters
          filters={filters}
          onRemove={(key) => setFilters((prev) => ({ ...prev, [key]: "" }))}
          onClearAll={() =>
            setFilters({
              type: "",
              distance: "5",
              availability: "",
              minMatchScore: 0,
              minRating: 0,
            })
          }
        />
      </div>
    </div>
  );
};

export default FilterSection;
