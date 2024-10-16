const shelterService = require("../services/shelterService");

const getShelters = async (req, res) => {
  try {
    const { search, id } = req.query;

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

    // Check if input is a zipcode (5 digit number)
    if (/^\d{5}$/.test(trimmedSearch)) {
      shelters = await shelterService.getSheltersByZipcode(trimmedSearch);
    }
    // Check if input is lat,lng (two decimal numbers separated by comma)
    else if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(trimmedSearch)) {
      const [lat, lng] = trimmedSearch.split(",").map(Number);
      shelters = await shelterService.getSheltersByLocation(lat, lng);
    }
    // Check if input is city, state (assumes format "City, State")
    else if (/^(.+),\s*(.+)$/.test(trimmedSearch)) {
      const [city, state] = trimmedSearch.split(",").map((s) => s.trim());
      shelters = await shelterService.getSheltersByStateCity(state, city);
    }
    // If none of the above, return an error
    else {
      return res.status(400).json({
        error:
          "Invalid search format. Please use zipcode, lat,lng, or city,state",
      });
    }

    res.json(shelters);
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching shelters" });
  }
};

module.exports = {
  getShelters,
};
