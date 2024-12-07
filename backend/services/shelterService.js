const https = require("https");
const { calculateDistance } = require("../utils/distance");
const { processBusinessHours } = require("../utils/processBusinessHours");
const ratingService = require("../services/ratingService");

const DISTANCE_MAX_POINTS = 30;
const TYPE_MAX_POINTS = 20;
const AVAILABILITY_MAX_POINTS = 15;
const RATING_MAX_POINTS = 20;
const CONTACT_MAX_POINTS = 15; // 5 points each for phone, website, email
const SERVICE_NEEDS_MAX_POINTS = 20;

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

function calculateRatingPoints(averageRating, maxPoints) {
  if (
    typeof averageRating !== "number" ||
    averageRating < 0 ||
    averageRating > 5
  ) {
    return 0;
  }
  return (averageRating / 5) * maxPoints;
}

const scoreShelter = (shelter, userPreferences) => {
  let totalPossiblePoints = 0;
  let earnedPoints = 0;

  // Distance scoring (max DISTANCE_MAX_POINTS points)
  // Only factor in distance if userLocation is provided
  if (userPreferences.userLocation && shelter.latitude && shelter.longitude) {
    totalPossiblePoints += DISTANCE_MAX_POINTS;
    const distance = calculateDistance(
      userPreferences.userLocation[0],
      userPreferences.userLocation[1],
      parseFloat(shelter.latitude),
      parseFloat(shelter.longitude)
    );
    shelter.distanceInMiles = parseFloat(distance.toFixed(2));

    // Deduct points for greater distances. (2 points lost per mile)
    const distancePenalty = distance * 2;
    earnedPoints += Math.max(DISTANCE_MAX_POINTS - distancePenalty, 0);
  }

  // Type matching (TYPE_MAX_POINTS points)
  // Only factor in type if userPreferences.type is provided
  if (userPreferences.type) {
    totalPossiblePoints += TYPE_MAX_POINTS;
    if (shelter.type === userPreferences.type) {
      earnedPoints += TYPE_MAX_POINTS;
    }
  }

  // Service availability scoring (AVAILABILITY_MAX_POINTS points)
  // Availability doesn't depend on user input, so always factor it in
  totalPossiblePoints += AVAILABILITY_MAX_POINTS;
  if (shelter.business_hours) {
    const { isOpen } = processBusinessHours(shelter.business_hours);
    if (isOpen) earnedPoints += AVAILABILITY_MAX_POINTS;
  }

  // Rating scoring (RATING_MAX_POINTS points)
  // If rating exists, factor it in regardless of user input (optional)
  if (shelter.rating && typeof shelter.rating.averageRating === "number") {
    totalPossiblePoints += RATING_MAX_POINTS;
    earnedPoints += calculateRatingPoints(
      shelter.rating.averageRating,
      RATING_MAX_POINTS
    );
  }

  // Contact information scoring (CONTACT_MAX_POINTS points)
  // Always factor contact info
  totalPossiblePoints += CONTACT_MAX_POINTS;
  if (shelter.phone_number) earnedPoints += 5;
  if (shelter.website) earnedPoints += 5;
  if (shelter.email) earnedPoints += 5;

  // Service matching scoring (SERVICE_NEEDS_MAX_POINTS points)
  // Only factor in if userPreferences.serviceNeeds is provided and not empty
  if (
    Array.isArray(userPreferences.serviceNeeds) &&
    userPreferences.serviceNeeds.length > 0
  ) {
    totalPossiblePoints += SERVICE_NEEDS_MAX_POINTS;
    if (shelter.description) {
      const matchedServices = userPreferences.serviceNeeds.filter((need) =>
        shelter.description.toLowerCase().includes(need.toLowerCase())
      );
      const matchRatio =
        matchedServices.length / userPreferences.serviceNeeds.length;
      earnedPoints += matchRatio * SERVICE_NEEDS_MAX_POINTS;
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
      earned: Math.round(earnedPoints * 100) / 100,
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
// Updated functions to attach rating
async function attachRatingsToShelters(shelters) {
  return Promise.all(
    shelters.map(async (shelter) => {
      // Suppose shelter.id corresponds to the organizationId
      const { averageRating, totalRatings } =
        await ratingService.getAverageRating(shelter.id);

      return {
        ...shelter,
        rating: {
          averageRating,
          totalRatings,
        },
      };
    })
  );
}

exports.getSheltersByZipcode = async (zipcode, userPreferences = {}) => {
  try {
    const shelters = await makeApiRequest(
      `/resources?zipcode=${encodeURIComponent(zipcode)}`
    );
    if (!Array.isArray(shelters)) return [];

    const scoredShelters = shelters
      .map((shelter) => scoreShelter(shelter, userPreferences))
      .sort((a, b) => b.matchScore - a.matchScore);

    return await attachRatingsToShelters(scoredShelters);
  } catch (error) {
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

    const scoredShelters = shelters
      .map((shelter) =>
        scoreShelter(shelter, { ...userPreferences, userLocation: [lat, lng] })
      )
      .sort((a, b) => b.matchScore - a.matchScore);

    return await attachRatingsToShelters(scoredShelters);
  } catch (error) {
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

    const scoredShelters = shelters
      .map((shelter) => scoreShelter(shelter, userPreferences))
      .sort((a, b) => b.matchScore - a.matchScore);

    return await attachRatingsToShelters(scoredShelters);
  } catch (error) {
    return [];
  }
};

exports.getShelterById = async (id) => {
  try {
    const shelter = await makeApiRequest(
      `/resources/${encodeURIComponent(id)}`
    );

    if (!shelter) return null;

    // Score the single shelter
    let scoredShelter = scoreShelter(shelter, {});

    // Attach rating
    const { averageRating, totalRatings } =
      await ratingService.getAverageRating(shelter.id);
    scoredShelter.rating = { averageRating, totalRatings };

    return scoredShelter;
  } catch (error) {
    return null;
  }
};
