import React from "react";

const ActiveFilters = ({ filters, onRemove, onClearAll }) => {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  if (activeFilters.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2 items-center">
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
        >
          {key}: {value}
          <button
            onClick={() => onRemove(key)}
            className="ml-2 hover:text-blue-600"
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
