const { getShelters } = require("../../controllers/shelterController");
const shelterService = require("../../services/shelterService");

// Mock the shelterService
jest.mock("../../services/shelterService");

describe("Shelter Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock console.error to prevent logging during tests
    console.error = jest.fn();
  });

  test("should return a shelter by ID if id parameter is provided", async () => {
    const mockShelter = { id: "123", name: "Shelter 1" };
    shelterService.getShelterById.mockResolvedValue(mockShelter);

    req.query.id = "123";
    await getShelters(req, res);

    expect(shelterService.getShelterById).toHaveBeenCalledWith("123");
    expect(res.json).toHaveBeenCalledWith(mockShelter);
  });

  test("should return 404 if shelter is not found by ID", async () => {
    shelterService.getShelterById.mockResolvedValue(null);

    req.query.id = "fake";
    await getShelters(req, res);

    expect(shelterService.getShelterById).toHaveBeenCalledWith("fake");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Shelter not found" });
  });

  test("should return 400 if search parameter is missing", async () => {
    await getShelters(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Search parameter is required",
    });
  });

  test("should return shelters for valid zipcode", async () => {
    const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
    shelterService.getSheltersByZipcode.mockResolvedValue(mockShelters);

    req.query.search = "12345";
    await getShelters(req, res);

    expect(shelterService.getSheltersByZipcode).toHaveBeenCalledWith("12345");
    expect(res.json).toHaveBeenCalledWith(mockShelters);
  });

  // New test for lat,lng search
  test("should return shelters for valid lat,lng", async () => {
    const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
    shelterService.getSheltersByLocation.mockResolvedValue(mockShelters);

    req.query.search = "40.7128,-74.0060";
    await getShelters(req, res);

    expect(shelterService.getSheltersByLocation).toHaveBeenCalledWith(
      40.7128,
      -74.006
    );
    expect(res.json).toHaveBeenCalledWith(mockShelters);
  });

  // New test for city,state search
  test("should return shelters for valid city,state", async () => {
    const mockShelters = [{ name: "Shelter 1" }, { name: "Shelter 2" }];
    shelterService.getSheltersByStateCity.mockResolvedValue(mockShelters);

    req.query.search = "New York, NY";
    await getShelters(req, res);

    expect(shelterService.getSheltersByStateCity).toHaveBeenCalledWith(
      "NY",
      "New York"
    );
    expect(res.json).toHaveBeenCalledWith(mockShelters);
  });

  test("should return 400 for invalid search format", async () => {
    req.query.search = "invalid search";
    await getShelters(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Invalid search format. Please use zipcode, lat,lng, or city,state",
    });
  });

  test("should handle service errors", async () => {
    const error = new Error("Service error");
    shelterService.getSheltersByZipcode.mockRejectedValue(error);

    req.query.search = "12345";
    await getShelters(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while fetching shelters",
    });
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching shelters:",
      error
    );
  });

  test("should trim whitespace from search input", async () => {
    const mockShelters = [{ name: "Shelter 1" }];
    shelterService.getSheltersByZipcode.mockResolvedValue(mockShelters);

    req.query.search = " 12345 ";
    await getShelters(req, res);

    expect(shelterService.getSheltersByZipcode).toHaveBeenCalledWith("12345");
  });
});
