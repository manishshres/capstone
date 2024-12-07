// components/Filters/FilterSection.jsx
import React from "react";
import { Filter } from "lucide-react";
import FilterItem from "./FilterItem";
import RatingFilter from "./RatingFilter";
import ActiveFilters from "./ActiveFilters";
import { useTranslation } from "react-i18next";

const FilterSection = ({ filters, setFilters }) => {
  const { t } = useTranslation();

  const serviceTypeOptions = [
    { value: "", label: t("filters.serviceTypeOptions.all") },
    { value: "foodbank", label: t("filters.serviceTypeOptions.foodBank") },
    { value: "shelter", label: t("filters.serviceTypeOptions.shelter") },
  ];

  const distanceOptions = [
    { value: "1", label: t("filters.distanceOptions.within1") },
    { value: "2", label: t("filters.distanceOptions.within2") },
    { value: "5", label: t("filters.distanceOptions.within5") },
    { value: "10", label: t("filters.distanceOptions.within10") },
  ];

  const availabilityOptions = [
    { value: "", label: t("filters.availabilityOptions.any") },
    { value: "open", label: t("filters.availabilityOptions.open") },
    { value: "closed", label: t("filters.availabilityOptions.closed") },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold">{t("filters.title")}</h3>
      </div>

      <div className="space-y-4">
        <FilterItem
          label={t("filters.serviceType")}
          value={filters.type}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, type: e.target.value }))
          }
          options={serviceTypeOptions}
        />

        <FilterItem
          label={t("filters.availability")}
          value={filters.availability}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, availability: e.target.value }))
          }
          options={availabilityOptions}
        />
        <FilterItem
          label={t("filters.distance")}
          value={filters.distance}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, distance: e.target.value }))
          }
          options={distanceOptions}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("filters.minMatchScore")}
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
