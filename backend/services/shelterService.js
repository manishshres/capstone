const https = require("https");

// Function to make an API request
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

    // Create a new request to the API
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks);
        try {
          resolve(JSON.parse(body.toString()));
        } catch (err) {
          reject(new Error("Failed to parse response body"));
        }
      });
    });

    // Handle request errors
    req.on("error", (error) => {
      reject(error);
    });

    req.end(); // End the request
  });
};

// Function to fetch shelters by ZIP code
const getSheltersByZipcode = (zipcode) => {
  return makeApiRequest(`/resources?zipcode=${encodeURIComponent(zipcode)}`);
};

// Function to fetch shelters by location (latitude & longitude)
const getSheltersByLocation = (lat, lng, radius = 1.4) => {
  return makeApiRequest(
    `/resources?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lng)}&radius=${encodeURIComponent(
      radius
    )}`
  );
};

// Function to fetch shelters by city and state
const getSheltersByStateCity = (state, city) => {
  return makeApiRequest(
    `/resources?state=${encodeURIComponent(state)}&city=${encodeURIComponent(
      city
    )}`
  );
};

// Function to fetch shelter details by ID
const getShelterById = (id) => {
  return makeApiRequest(`/resources/${encodeURIComponent(id)}`);
};

module.exports = {
  getSheltersByZipcode,
  getSheltersByLocation,
  getSheltersByStateCity,
  getShelterById,
};
