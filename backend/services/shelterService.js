const https = require("https");

const makeApiRequest = (path) => {
  return new Promise((resolve, reject) => {
    const keyName = `RAPIDAPI_KEY_${Math.floor(Math.random() * 3) + 1}`;
    const apiKey = process.env[keyName];

    const options = {
      method: "GET",
      hostname: "homeless-shelter.p.rapidapi.com",
      port: null,
      path: path,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "homeless-shelter.p.rapidapi.com",
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body.toString()));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

const getSheltersByZipcode = (zipcode) => {
  return makeApiRequest(`/zipcode?zipcode=${zipcode}`);
};

const getSheltersByLocation = (lat, lng, radius = 1.4) => {
  return makeApiRequest(`/location?lat=${lat}&lng=${lng}&radius=${radius}`);
};

const getSheltersByStateCity = (state, city) => {
  return makeApiRequest(
    `/state-city?state=${encodeURIComponent(state)}&city=${encodeURIComponent(
      city
    )}`
  );
};

const getShelterById = (id) => {
  return makeApiRequest(`/shelter?id=${id}`);
};

module.exports = {
  getSheltersByZipcode,
  getSheltersByLocation,
  getSheltersByStateCity,
  getShelterById,
};
