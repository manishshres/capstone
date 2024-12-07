const { getShelters } = require("../../controllers/shelterController");
const shelterService = require("../../services/shelterService");
const { logger } = require("../../utils/logger");

jest.mock("../../services/shelterService");
jest.mock("../../utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Shelter Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    console.error = jest.fn();
  });

  describe("when id is provided", () => {
    test("should return a shelter by ID", async () => {
      const mockShelter = { id: "123", name: "Shelter 1" };
      shelterService.getShelterById.mockResolvedValue(mockShelter);

      req.query.id = "123";
      await getShelters(req, res);

      expect(shelterService.getShelterById).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith(mockShelter);
    });

    test("should return 404 if shelter not found by ID", async () => {
      shelterService.getShelterById.mockResolvedValue(null);

      req.query.id = "fake";
      await getShelters(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Shelter not found" });
    });
  });

  describe("when searching by other criteria", () => {
    test("should return 400 if search parameter is missing", async () => {
      await getShelters(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Search parameter is required",
      });
    });

    test("should return shelters for valid zipcode and include searchCriteria", async () => {
      const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
      shelterService.getSheltersByZipcode.mockResolvedValue(mockShelters);

      req.query.search = "12345";
      req.query.serviceNeeds = "food,clothing";
      req.query.type = "shelter";
      req.query.radius = "2.5";

      await getShelters(req, res);

      expect(shelterService.getSheltersByZipcode).toHaveBeenCalledWith(
        "12345",
        expect.objectContaining({
          serviceNeeds: ["food", "clothing"],
          type: "shelter",
          radius: 2.5,
        })
      );

      expect(res.json).toHaveBeenCalledWith({
        results: mockShelters,
        count: mockShelters.length,
        searchCriteria: {
          search: "12345",
          serviceNeeds: ["food", "clothing"],
          type: "shelter",
          radius: 2.5,
        },
      });
    });

    test("should return shelters for valid lat,lng and include searchCriteria", async () => {
      const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
      shelterService.getSheltersByLocation.mockResolvedValue(mockShelters);

      req.query.search = "40.7128,-74.0060";

      await getShelters(req, res);

      expect(shelterService.getSheltersByLocation).toHaveBeenCalledWith(
        40.7128,
        -74.006,
        1.4, // default radius if none provided
        expect.objectContaining({
          serviceNeeds: [],
          type: undefined,
          radius: 1.4,
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        results: mockShelters,
        count: mockShelters.length,
        searchCriteria: {
          search: "40.7128,-74.0060",
          serviceNeeds: [],
          type: undefined,
          radius: 1.4,
        },
      });
    });

    test("should return shelters for valid city,state and include searchCriteria", async () => {
      const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
      shelterService.getSheltersByStateCity.mockResolvedValue(mockShelters);

      req.query.search = "New York, NY";
      req.query.type = "foodbank";

      await getShelters(req, res);

      expect(shelterService.getSheltersByStateCity).toHaveBeenCalledWith(
        "NY",
        "New York",
        expect.objectContaining({
          serviceNeeds: [],
          type: "foodbank",
          radius: 1.4,
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        results: mockShelters,
        count: mockShelters.length,
        searchCriteria: {
          search: "New York, NY",
          serviceNeeds: [],
          type: "foodbank",
          radius: 1.4,
        },
      });
    });

    test("should return 400 for invalid search format", async () => {
      req.query.search = "invalid search";
      await getShelters(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid search format. Please use 'zipcode', 'lat,lng', or 'city,state'",
      });
    });

    test("should handle service errors gracefully", async () => {
      const error = new Error("Service error");
      shelterService.getSheltersByZipcode.mockRejectedValue(error);

      req.query.search = "12345";
      await getShelters(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching shelters:",
        error
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An error occurred while fetching shelters",
      });
    });

    test("should trim whitespace from search input", async () => {
      const mockShelters = [{ name: "Shelter 1" }];
      shelterService.getSheltersByZipcode.mockResolvedValue(mockShelters);

      req.query.search = " 12345 ";
      await getShelters(req, res);

      expect(shelterService.getSheltersByZipcode).toHaveBeenCalledWith(
        "12345",
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        results: mockShelters,
        count: 1,
        searchCriteria: {
          search: "12345",
          serviceNeeds: [],
          type: undefined,
          radius: 1.4,
        },
      });
    });
  });
});
