const https = require("https");
const { calculateDistance } = require("../utils/distance");
const { processBusinessHours } = require("../utils/processBusinessHours");

const makeApiRequest = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: "homeless-shelters-and-foodbanks-api.p.rapidapi.com",
      port: null,
      path: path,
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "homeless-shelters-and-foodbanks-api.p.rapidapi.com",
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));

      res.on("end", () => {
        const body = Buffer.concat(chunks);
        try {
          resolve(JSON.parse(body.toString()));
        } catch (err) {
          reject(new Error("Failed to parse response body"));
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

const scoreShelter = (shelter, userPreferences) => {
  let totalPossiblePoints = 0;
  let earnedPoints = 0;

  // Distance scoring (max 30 points)
  if (userPreferences.userLocation && shelter.latitude && shelter.longitude) {
    totalPossiblePoints += 30;
    const distance = calculateDistance(
      userPreferences.userLocation[0],
      userPreferences.userLocation[1],
      parseFloat(shelter.latitude),
      parseFloat(shelter.longitude)
    );

    shelter.distanceInMiles = parseFloat(distance.toFixed(2));
    earnedPoints += Math.max(30 - distance * 2, 0);
  }

  // Type matching (20 points)
  if (userPreferences.type) {
    totalPossiblePoints += 20;
    if (shelter.type === userPreferences.type) {
      earnedPoints += 20;
    }
  }

  // Service availability scoring (15 points)
  totalPossiblePoints += 15;
  if (shelter.business_hours) {
    const { isOpen } = processBusinessHours(shelter.business_hours);
    if (isOpen) earnedPoints += 15;
  }

  // Contact information scoring (15 points total)
  totalPossiblePoints += 15;
  if (shelter.phone_number) earnedPoints += 5;
  if (shelter.website) earnedPoints += 5;
  if (shelter.email) earnedPoints += 5;

  // Service matching scoring (20 points)
  if (userPreferences.serviceNeeds?.length > 0) {
    totalPossiblePoints += 20;
    if (shelter.description) {
      const matchedServices = userPreferences.serviceNeeds.filter((need) =>
        shelter.description.toLowerCase().includes(need.toLowerCase())
      );
      earnedPoints +=
        (matchedServices.length / userPreferences.serviceNeeds.length) * 20;
    }
  }

  // Calculate percentage score
  const percentageScore =
    totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;

  return {
    ...shelter,
    matchScore: Math.round(percentageScore * 100) / 100,
    matchScoreDetails: {
      totalPossible: totalPossiblePoints,
      earned: earnedPoints,
      percentage: Math.round(percentageScore * 100) / 100,
    },
    formattedAddress:
      shelter.full_address ||
      `${shelter.address || ""}, ${shelter.city}, ${shelter.state} ${
        shelter.zipcode
      }`,
    contactInfo: {
      phone: shelter.phone_number,
      website: shelter.website,
      email: shelter.email,
    },
    serviceDetails: {
      type: shelter.type,
      hours: processBusinessHours(shelter.business_hours).schedule,
      description: shelter.description,
    },
  };
};

exports.getSheltersByZipcode = async (zipcode, userPreferences = {}) => {
  try {
    const shelters = await makeApiRequest(
      `/resources?zipcode=${encodeURIComponent(zipcode)}`
    );
    if (!Array.isArray(shelters)) return [];

    return shelters
      .map((shelter) => scoreShelter(shelter, userPreferences))
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in getSheltersByZipcode:", error);
    return [];
  }
};

exports.getSheltersByLocation = async (
  lat,
  lng,
  radius = 1.4,
  userPreferences = {}
) => {
  try {
    const shelters = await makeApiRequest(
      `/resources?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(lng)}&radius=${encodeURIComponent(
        radius
      )}`
    );

    if (!Array.isArray(shelters)) return [];

    return shelters
      .map((shelter) =>
        scoreShelter(shelter, { ...userPreferences, userLocation: [lat, lng] })
      )
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in getSheltersByLocation:", error);
    return [];
  }
};

exports.getSheltersByStateCity = async (state, city, userPreferences = {}) => {
  try {
    const shelters = await makeApiRequest(
      `/resources?state=${encodeURIComponent(state)}&city=${encodeURIComponent(
        city
      )}`
    );

    if (!Array.isArray(shelters)) return [];

    return shelters
      .map((shelter) => scoreShelter(shelter, userPreferences))
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in getSheltersByStateCity:", error);
    return [];
  }
};

exports.getShelterById = async (id) => {
  try {
    const shelter = await makeApiRequest(
      `/resources/${encodeURIComponent(id)}`
    );
    return shelter ? scoreShelter(shelter, {}) : null;
  } catch (error) {
    console.error("Error in getShelterById:", error);
    return null;
  }
};
