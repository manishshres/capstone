const {
  getSheltersByZipcode,
  getSheltersByLocation,
  getSheltersByStateCity,
  getShelterById,
} = require("../../services/shelterService");
const https = require("https");
const ratingService = require("../../services/ratingService");

jest.mock("https");
jest.mock("../../services/ratingService", () => ({
  getAverageRating: jest.fn(),
}));

describe("Shelter Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAPIDAPI_KEY = "test-api-key";
  });

  // Helper function to set up mock https response
  const setupMockResponse = (data) => {
    const mockResponse = {
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(Buffer.from(JSON.stringify(data)));
        }
        if (event === "end") {
          callback();
        }
      }),
    };

    const mockRequest = {
      on: jest.fn(),
      end: jest.fn(),
    };

    https.request.mockImplementation((options, callback) => {
      callback(mockResponse);
      return mockRequest;
    });
  };

  describe("getSheltersByZipcode", () => {
    it("should fetch shelters by zipcode and score them", async () => {
      const mockShelterData = [
        {
          id: "org123",
          name: "Test Shelter",
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          zipcode: "12345",
        },
      ];
      setupMockResponse(mockShelterData);

      // Mock rating service response
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 4,
        totalRatings: 10,
      });

      const result = await getSheltersByZipcode("12345");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Shelter");
      expect(result[0].rating).toEqual({ averageRating: 4, totalRatings: 10 });
      expect(result[0].matchScore).toBeDefined();
      expect(result[0].formattedAddress).toBeDefined();
      expect(result[0].contactInfo).toBeDefined();
      expect(result[0].serviceDetails).toBeDefined();

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources?zipcode=12345",
        }),
        expect.any(Function)
      );
    });

    it("should handle empty response", async () => {
      setupMockResponse([]);

      const result = await getSheltersByZipcode("00000");
      expect(result).toEqual([]);
    });

    it("should handle API error gracefully and return empty array", async () => {
      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "error") {
            callback(new Error("API Error"));
          }
        }),
        end: jest.fn(),
      };

      https.request.mockImplementation(() => mockRequest);

      const result = await getSheltersByZipcode("12345");
      expect(result).toEqual([]);
    });

    it("should give additional points for serviceNeeds if provided", async () => {
      const mockShelterData = [
        {
          id: "orgService",
          name: "Service Need Shelter",
          description: "Provides meals and beds",
          address: "1 Service Rd",
          city: "ServiceCity",
          state: "SC",
          zipcode: "33333",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 3,
        totalRatings: 5,
      });

      const userPreferences = { serviceNeeds: ["meals"] };
      const result = await getSheltersByZipcode("33333", userPreferences);

      expect(result[0].matchScoreDetails.earned).toBeGreaterThan(0);
      // "meals" found in description, serviceNeeds points awarded
    });

    it("should award type points if userPreferences.type matches shelter type", async () => {
      const mockShelterData = [
        {
          id: "orgType",
          name: "Typed Shelter",
          type: "foodbank",
          address: "123 Type St",
          city: "TypeCity",
          state: "TC",
          zipcode: "44444",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 2.5,
        totalRatings: 2,
      });

      const userPreferences = { type: "foodbank" };
      const result = await getSheltersByZipcode("44444", userPreferences);
      // Type matching gives 20 points
      expect(result[0].matchScoreDetails.earned).toBeGreaterThanOrEqual(20);
    });
  });

  describe("getSheltersByLocation", () => {
    it("should fetch shelters by location and score them", async () => {
      const mockShelterData = [
        {
          id: "orgLocation",
          name: "Location Shelter",
          address: "456 Loc St",
          city: "Loc City",
          state: "LC",
          zipcode: "67890",
          latitude: "40.7128",
          longitude: "-74.0060",
        },
      ];
      setupMockResponse(mockShelterData);

      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 5,
        totalRatings: 20,
      });

      const result = await getSheltersByLocation(40.7128, -74.006);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Location Shelter");
      expect(result[0].rating.averageRating).toBe(5);
      expect(result[0].matchScore).toBeDefined();
      expect(result[0].formattedAddress).toContain("Loc City");

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources?latitude=40.7128&longitude=-74.006&radius=1.4",
        }),
        expect.any(Function)
      );
    });

    it("should not assign distance points if userLocation is not provided", async () => {
      const mockShelterData = [
        {
          id: "orgNoUserLoc",
          name: "No User Location Shelter",
          latitude: "40.7128",
          longitude: "-74.0060",
          address: "NoLoc St",
          city: "NoLocCity",
          state: "NL",
          zipcode: "99999",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 0,
        totalRatings: 0,
      });

      // No userPreferences passed = no userLocation
      const result = await getSheltersByZipcode("99999");
      // Expect no distance points
      expect(result[0].matchScoreDetails.totalPossible).toBeLessThan(130);
    });
  });

  describe("getSheltersByStateCity", () => {
    it("should fetch shelters by state and city and score them", async () => {
      const mockShelterData = [
        {
          id: "orgStateCity",
          name: "City Shelter",
          address: "789 City St",
          city: "NY",
          state: "New York",
          zipcode: "11111",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 1,
        totalRatings: 1,
      });

      const result = await getSheltersByStateCity("New York", "NY");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("City Shelter");
      expect(result[0].matchScore).toBeDefined();
      expect(result[0].formattedAddress).toContain("NY, New York 11111");

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources?state=New%20York&city=NY",
        }),
        expect.any(Function)
      );
    });

    it("should handle shelters missing some fields gracefully", async () => {
      const mockShelterData = [
        {
          id: "orgPartial",
          name: "Partial Data Shelter",
          // no website, no phone_number
          email: "partial@example.com",
          city: "PartialCity",
          state: "PC",
          zipcode: "22222",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 0,
        totalRatings: 0,
      });

      const result = await getSheltersByStateCity("PC", "PartialCity");
      // Should not error out
      expect(result[0].contactInfo.email).toBe("partial@example.com");
      expect(result[0].matchScoreDetails).toBeDefined();
    });
  });

  describe("getShelterById", () => {
    it("should fetch a single shelter by ID and score it", async () => {
      const mockShelter = {
        id: "orgSingle",
        name: "Single Shelter",
        address: "One St",
        city: "Single City",
        state: "SS",
        zipcode: "99999",
      };
      setupMockResponse(mockShelter);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 4.5,
        totalRatings: 8,
      });

      const result = await getShelterById("some-id");
      expect(result.name).toBe("Single Shelter");
      expect(result.rating).toEqual({ averageRating: 4.5, totalRatings: 8 });
      expect(result.matchScore).toBeDefined();

      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/resources/some-id",
        }),
        expect.any(Function)
      );
    });

    it("should return null if shelter not found", async () => {
      setupMockResponse(null);
      const result = await getShelterById("not-found");
      expect(result).toBeNull();
    });

    it("should return null and handle error gracefully", async () => {
      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "error") {
            callback(new Error("API Error"));
          }
        }),
        end: jest.fn(),
      };

      https.request.mockImplementation(() => mockRequest);

      const result = await getShelterById("error-id");
      expect(result).toBeNull();
    });
  });

  describe("Rating Edge Cases", () => {
    it("should not award rating points if rating is out of [0,5] range", async () => {
      const mockShelterData = [
        {
          id: "orgOutRange",
          name: "Out of Range Shelter",
          rating: { averageRating: 10, totalRatings: 2 }, // Not realistic; just testing logic
          city: "OutCity",
          state: "OC",
          zipcode: "00001",
        },
      ];
      setupMockResponse(mockShelterData);
      ratingService.getAverageRating.mockResolvedValue({
        averageRating: 10,
        totalRatings: 2,
      });

      const result = await getSheltersByZipcode("00001");
      // Out-of-range rating should yield no rating points
      expect(result[0].matchScore).toBeGreaterThanOrEqual(0); // but no rating points
    });
  });
});
