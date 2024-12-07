import React from "react";
import { Star } from "lucide-react";

const RatingFilter = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Minimum Rating
      </label>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`p-1 ${
              value === rating
                ? "text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          >
            <Star
              className={`h-5 w-5 ${rating <= value ? "fill-current" : ""}`}
            />
          </button>
        ))}
        {value > 0 && (
          <button
            onClick={() => onChange(0)}
            className="ml-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingFilter;
