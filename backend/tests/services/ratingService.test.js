const { ObjectId } = require("mongodb");
const ratingService = require("../../services/ratingService");
const { connectToDatabase } = require("../../config/mongoDbClient");

jest.mock("../../config/mongoDbClient");

describe("Rating Service", () => {
  let mockDb;
  let mockRatings;
  let mockServiceRequests;
  let mockRatingStats;

  beforeEach(() => {
    mockRatings = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockServiceRequests = {
      findOne: jest.fn(),
    };

    mockRatingStats = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      insertOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === "ratings") return mockRatings;
        if (name === "serviceRequests") return mockServiceRequests;
        if (name === "organizationRatingStats") return mockRatingStats;
      }),
    };

    connectToDatabase.mockResolvedValue(mockDb);
  });

  describe("createRating", () => {
    const userId = "user123";
    const serviceRequestId = "request123";
    const ratingData = {
      rating: 5,
      feedback: "Great service!",
    };

    it("should create a new rating successfully", async () => {
      const mockServiceRequest = {
        _id: serviceRequestId,
        organizationId: "org123",
        serviceName: "Test Service",
      };

      mockServiceRequests.findOne.mockResolvedValue(mockServiceRequest);
      mockRatings.findOne.mockResolvedValue(null);
      mockRatings.insertOne.mockResolvedValue({ insertedId: "rating123" });
      mockRatingStats.findOne.mockResolvedValue({
        organizationId: "org123",
        averageRating: 4.5,
        totalRatings: 10,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 },
      });

      const result = await ratingService.createRating(
        userId,
        serviceRequestId,
        ratingData
      );

      expect(result).toEqual({
        success: true,
        ratingId: "rating123",
      });

      expect(mockRatings.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          organizationId: "org123",
          serviceRequestId,
          rating: 5,
          feedback: "Great service!",
          status: "active",
        })
      );

      expect(mockRatingStats.updateOne).toHaveBeenCalled();
    });

    it("should throw error if service request not found", async () => {
      mockServiceRequests.findOne.mockResolvedValue(null);

      await expect(
        ratingService.createRating(userId, serviceRequestId, ratingData)
      ).rejects.toThrow("Service request not found");
    });

    it("should throw error if user already rated", async () => {
      mockServiceRequests.findOne.mockResolvedValue({
        _id: serviceRequestId,
        organizationId: "org123",
      });
      mockRatings.findOne.mockResolvedValue({ _id: "existingRating" });

      await expect(
        ratingService.createRating(userId, serviceRequestId, ratingData)
      ).rejects.toThrow("You have already rated this service");
    });
  });

  describe("getOrganizationRatings", () => {
    const organizationId = "org123";

    it("should get paginated ratings with metadata", async () => {
      const mockRatingsData = [
        { _id: "rating1", rating: 5 },
        { _id: "rating2", rating: 4 },
      ];

      mockRatings.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockRatingsData),
      });

      mockRatings.countDocuments.mockResolvedValue(10);

      const result = await ratingService.getOrganizationRatings(
        organizationId,
        {
          page: 1,
          limit: 2,
        }
      );

      expect(result).toEqual({
        ratings: mockRatingsData,
        metadata: {
          total: 10,
          page: 1,
          totalPages: 5,
        },
      });
    });

    it("should apply rating filters correctly", async () => {
      await ratingService.getOrganizationRatings(organizationId, {
        minRating: 4,
        maxRating: 5,
      });

      expect(mockRatings.find).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          status: "active",
          rating: { $gte: 4, $lte: 5 },
        })
      );
    });
  });

  describe("getOrganizationRatingStats", () => {
    const organizationId = "org123";

    it("should return existing stats", async () => {
      const mockStats = {
        organizationId,
        averageRating: 4.5,
        totalRatings: 10,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 },
      };

      mockRatingStats.findOne.mockResolvedValue(mockStats);

      const result = await ratingService.getOrganizationRatingStats(
        organizationId
      );

      expect(result).toEqual(mockStats);
    });

    it("should return default stats if none exist", async () => {
      mockRatingStats.findOne.mockResolvedValue(null);

      const result = await ratingService.getOrganizationRatingStats(
        organizationId
      );

      expect(result).toEqual({
        organizationId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    });
  });

  describe("respondToRating", () => {
    const ratingId = "rating123";
    const organizationId = "org123";
    const response = "Thank you for your feedback!";

    it("should add response to rating successfully", async () => {
      mockRatings.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await ratingService.respondToRating(
        ratingId,
        organizationId,
        response
      );

      expect(result).toBe(true);
      expect(mockRatings.updateOne).toHaveBeenCalledWith(
        {
          _id: expect.any(ObjectId),
          organizationId,
        },
        expect.objectContaining({
          $set: {
            response: {
              text: response,
              respondedAt: expect.any(Date),
              respondedBy: organizationId,
            },
            updatedAt: expect.any(Date),
          },
        })
      );
    });

    it("should return false if rating not found", async () => {
      mockRatings.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await ratingService.respondToRating(
        ratingId,
        organizationId,
        response
      );

      expect(result).toBe(false);
    });
  });
});
