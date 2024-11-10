const {
  getSheltersByZipcode,
  getSheltersByLocation,
  getSheltersByStateCity,
} = require("../../services/shelterService");
const https = require("https");

// Mock the https module
jest.mock("https");

describe("Shelter Service", () => {
  const mockShelterData = [
    {
      name: "Test Shelter",
      address: "123 Test St",
      city: "Test City",
      state: "TS",
      zip_code: "12345",
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Set up a mock API key
    process.env.RAPIDAPI_KEY_1 = "test-api-key";
  });

  // Helper function to set up mock response
  const setupMockResponse = (data) => {
    const mockResponse = {
      on: jest.fn((event, callback) => {
        if (event === "data") {
          // Return mock data as Buffer
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

  test("should fetch shelters by zipcode", async () => {
    setupMockResponse(mockShelterData);

    const result = await getSheltersByZipcode("12345");

    expect(result).toEqual(mockShelterData);
    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/resources?zipcode=12345",
      }),
      expect.any(Function)
    );
  });

  test("should fetch shelters by location", async () => {
    setupMockResponse(mockShelterData);

    const result = await getSheltersByLocation(40.7128, -74.006);

    expect(result).toEqual(mockShelterData);
    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/resources?latitude=40.7128&longitude=-74.006&radius=1.4",
      }),
      expect.any(Function)
    );
  });

  test("should fetch shelters by state and city", async () => {
    setupMockResponse(mockShelterData);

    const result = await getSheltersByStateCity("New York", "NY");

    expect(result).toEqual(mockShelterData);
    expect(https.request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/resources?state=New%20York&city=NY",
      }),
      expect.any(Function)
    );
  });

  test("should handle empty response", async () => {
    setupMockResponse([]);

    const result = await getSheltersByZipcode("00000");

    expect(result).toEqual([]);
  });

  // New test for handling API errors
  test("should handle API error", async () => {
    const mockRequest = {
      on: jest.fn((event, callback) => {
        if (event === "error") {
          callback(new Error("API Error"));
        }
      }),
      end: jest.fn(),
    };

    https.request.mockImplementation(() => mockRequest);

    await expect(getSheltersByZipcode("12345")).rejects.toThrow("API Error");
  });
});
