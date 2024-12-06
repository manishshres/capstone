const shelterService = require("../services/shelterService");
const { logger } = require("../utils/logger");

exports.getShelters = async (req, res) => {
  try {
    const { search, id, serviceNeeds, type, radius } = req.query;

    const userPreferences = {
      serviceNeeds: serviceNeeds ? serviceNeeds.split(",") : [],
      type,
      radius: radius ? parseFloat(radius) : 1.4,
    };

    if (id) {
      const shelter = await shelterService.getShelterById(id);
      if (!shelter) {
        return res.status(404).json({ error: "Shelter not found" });
      }
      return res.json(shelter);
    }

    if (!search) {
      return res.status(400).json({ error: "Search parameter is required" });
    }

    const trimmedSearch = search.trim();
    let shelters;

    if (/^\d{5}$/.test(trimmedSearch)) {
      shelters = await shelterService.getSheltersByZipcode(
        trimmedSearch,
        userPreferences
      );
    } else if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(trimmedSearch)) {
      const [lat, lng] = trimmedSearch.split(",").map(Number);
      shelters = await shelterService.getSheltersByLocation(
        lat,
        lng,
        userPreferences.radius,
        userPreferences
      );
    } else if (/^([A-Za-z\s]+),\s*([A-Za-z\s]+)$/.test(trimmedSearch)) {
      const [city, state] = trimmedSearch.split(",").map((s) => s.trim());
      shelters = await shelterService.getSheltersByStateCity(
        state,
        city,
        userPreferences
      );
    } else {
      return res.status(400).json({
        error:
          "Invalid search format. Please use 'zipcode', 'lat,lng', or 'city,state'",
      });
    }

    res.json({
      results: shelters,
      count: shelters.length,
      searchCriteria: {
        search: trimmedSearch,
        ...userPreferences,
      },
    });
  } catch (error) {
    logger.error("Error fetching shelters:", error);
    res.status(500).json({
      error: "An error occurred while fetching shelters",
    });
  }
};
