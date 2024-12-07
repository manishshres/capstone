// lib/filterUtils.js
export const applyFilters = (shelters, filters) => {
  return shelters.filter((shelter) => {
    // Type filter
    if (filters.type && shelter.serviceDetails.type !== filters.type) {
      return false;
    }

    // Availability filter
    if (filters.availability) {
      const isOpen = Object.values(shelter.serviceDetails.hours || {}).some(
        (hours) => hours.toLowerCase().includes("open")
      );
      if (filters.availability === "open" && !isOpen) return false;
      if (filters.availability === "closed" && isOpen) return false;
    }

    // Match score filter
    if (filters.minMatchScore && shelter.matchScore < filters.minMatchScore) {
      return false;
    }

    // Rating filter
    const averageRating = shelter.rating?.averageRating ?? 0;
    if (filters.minRating > 0 && averageRating < filters.minRating) {
      return false;
    }

    return true;
  });
};
