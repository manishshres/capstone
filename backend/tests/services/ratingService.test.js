const { ObjectId } = require("mongodb");
const ratingService = require("../../services/ratingService");
const { connectToDatabase } = require("../../config/mongoDbClient");
const { logger } = require("../../utils/logger");

jest.mock("../../config/mongoDbClient");
jest.mock("../../utils/logger");

describe("Rating Service", () => {
  let mockDb;
  let mockRatings;
  let mockOrganizations;

  beforeEach(() => {
    mockRatings = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      updateOne: jest.fn(),
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
    };

    mockOrganizations = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        switch (name) {
          case "ratings":
            return mockRatings;
          case "organizations":
            return mockOrganizations;
          default:
            return null;
        }
      }),
    };

    connectToDatabase.mockResolvedValue(mockDb);
    jest.clearAllMocks();
  });

  describe("createRating", () => {
    const organizationId = "org123";
    const userId = "user123";
    const ratingData = {
      rating: 5,
      comment: "Great service!",
    };

    it("should create a new rating when none exists", async () => {
      const mockOrg = {
        userId: "orgMongoId123",
      };
      const mockInsertedId = new ObjectId();

      // Organization found by _id
      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg) // Found on first try by _id
        .mockResolvedValueOnce(null); // No second call

      mockRatings.findOne.mockResolvedValue(null); // No existing rating
      mockRatings.insertOne.mockResolvedValue({ insertedId: mockInsertedId });

      const result = await ratingService.createRating(
        organizationId,
        userId,
        ratingData
      );

      // Verify organization lookups
      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        _id: organizationId,
      });
      // Insert new rating
      expect(mockRatings.insertOne).toHaveBeenCalledWith({
        organizationId: "orgMongoId123",
        userId,
        rating: 5,
        comment: "Great service!",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Now that createRating returns true, we expect the result to be true
      // instead of checking against insertedId.
      expect(result).toBe(true);
    });

    it("should update existing rating if user already rated", async () => {
      const mockOrg = {
        userId: "orgMongoId123",
      };
      const existingRating = {
        _id: new ObjectId(),
        organizationId: "orgMongoId123",
        userId,
        rating: 4,
        comment: "Old comment",
      };

      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);

      mockRatings.findOne.mockResolvedValue(existingRating);

      await ratingService.createRating(organizationId, userId, ratingData);

      expect(mockRatings.updateOne).toHaveBeenCalledWith(
        { _id: existingRating._id },
        {
          $set: {
            rating: ratingData.rating,
            comment: ratingData.comment,
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it("should throw error when organization not found", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce(null) // Not found by _id
        .mockResolvedValueOnce(null); // Not found by profile.org_id

      await expect(
        ratingService.createRating(organizationId, userId, ratingData)
      ).rejects.toThrow("Organization not found");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRatingById", () => {
    const ratingId = new ObjectId().toHexString();

    it("should return rating when found", async () => {
      const mockRating = {
        _id: ObjectId.createFromHexString(ratingId),
        rating: 5,
        comment: "Great service!",
      };
      mockRatings.findOne.mockResolvedValue(mockRating);

      const result = await ratingService.getRatingById(ratingId);

      expect(mockRatings.findOne).toHaveBeenCalledWith({
        _id: ObjectId.createFromHexString(ratingId),
      });
      expect(result).toEqual(mockRating);
    });

    it("should throw error when rating not found", async () => {
      mockRatings.findOne.mockResolvedValue(null);

      await expect(ratingService.getRatingById(ratingId)).rejects.toThrow(
        "Rating not found"
      );

      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error with invalid ObjectId", async () => {
      const invalidId = "invalid-id";

      await expect(ratingService.getRatingById(invalidId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateRating", () => {
    const ratingId = new ObjectId().toHexString();
    const updates = {
      rating: 4,
      comment: "Updated comment",
    };
    const existingRating = {
      _id: ObjectId.createFromHexString(ratingId),
      organizationId: "orgMongoId123",
      userId: "user123",
      rating: 3,
      comment: "Old comment",
    };

    // it("should update rating successfully", async () => {
    //   const ratingId = new ObjectId().toHexString();
    //   const updates = { rating: 4, comment: "Updated comment" };

    //   const existingRating = {
    //     _id: ObjectId.createFromHexString(ratingId),
    //     organizationId: "orgMongoId123",
    //     userId: "user123",
    //     rating: 3,
    //     comment: "Old comment",
    //   };

    //   mockRatings.findOne.mockResolvedValueOnce(existingRating);

    //   // Return the organization by userId: orgMongoId123
    //   mockOrganizations.findOne.mockResolvedValueOnce({
    //     _id: new ObjectId(),
    //     userId: "orgMongoId123",
    //   });

    //   // Mock DB updates
    //   mockRatings.updateOne.mockResolvedValue({ matchedCount: 1 });
    //   mockOrganizations.updateOne.mockResolvedValue({ matchedCount: 1 });

    //   // Mock getAverageRating if needed
    //   mockRatings
    //     .aggregate()
    //     .toArray.mockResolvedValue([{ averageRating: 4, totalRatings: 10 }]);

    //   const result = await ratingService.updateRating(ratingId, updates);

    //   expect(mockRatings.updateOne).toHaveBeenCalledWith(
    //     { _id: ObjectId.createFromHexString(ratingId) },
    //     {
    //       $set: {
    //         ...updates,
    //         organizationId: "orgMongoId123",
    //         updatedAt: expect.any(Date),
    //       },
    //     }
    //   );
    //   expect(result).toBe(true);
    // });

    it("should throw error when rating not found to update", async () => {
      const mockOrg = { userId: "orgMongoId123" };
      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);

      mockRatings.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        ratingService.updateRating(ratingId, updates)
      ).rejects.toThrow("Rating not found");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error when organization not found for update", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(
        ratingService.updateRating(ratingId, updates)
      ).rejects.toThrow("Rating not found");
    });

    it("should throw error with invalid ObjectId for ratingId", async () => {
      const invalidId = "invalid-id";

      await expect(
        ratingService.updateRating(invalidId, updates)
      ).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRatings", () => {
    const organizationId = "org123";

    it("should return list of ratings when organization found", async () => {
      const mockOrg = { userId: "orgMongoId123" };
      const mockRatingsList = [
        { _id: new ObjectId(), rating: 5, comment: "Great!" },
        { _id: new ObjectId(), rating: 4, comment: "Good" },
      ];

      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);
      mockRatings.find().toArray.mockResolvedValue(mockRatingsList);

      const result = await ratingService.getRatings(organizationId);

      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        _id: organizationId,
      });
      expect(mockRatings.find).toHaveBeenCalledWith({
        organizationId: "orgMongoId123",
      });
      expect(result).toEqual(mockRatingsList);
    });

    it("should return empty array if organization not found", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await ratingService.getRatings(organizationId);

      expect(result).toEqual([]);
    });

    it("should return empty array and log error if database error", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce({ userId: "orgMongoId123" })
        .mockResolvedValueOnce(null);

      mockRatings.find().toArray.mockRejectedValue(new Error("Database error"));

      const result = await ratingService.getRatings(organizationId);

      expect(logger.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("getAverageRating", () => {
    const organizationId = "org123";

    it("should return average rating and total ratings", async () => {
      const mockOrg = { userId: "orgMongoId123" };
      const mockAggregationResult = [
        { _id: "orgMongoId123", averageRating: 4.5, totalRatings: 2 },
      ];

      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);

      // Mock aggregation
      const mockAggregate = {
        toArray: jest.fn().mockResolvedValue(mockAggregationResult),
      };
      mockRatings.aggregate.mockReturnValue(mockAggregate);

      const result = await ratingService.getAverageRating(organizationId);

      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        _id: organizationId,
      });
      expect(mockRatings.aggregate).toHaveBeenCalledWith([
        { $match: { organizationId: "orgMongoId123" } },
        {
          $group: {
            _id: "$organizationId",
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
          },
        },
      ]);
      expect(result).toEqual({ averageRating: 4.5, totalRatings: 2 });
    });

    it("should return default values if no ratings found", async () => {
      const mockOrg = { userId: "orgMongoId123" };
      mockOrganizations.findOne
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);

      const mockAggregate = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockRatings.aggregate.mockReturnValue(mockAggregate);

      const result = await ratingService.getAverageRating(organizationId);

      expect(result).toEqual({ averageRating: 0, totalRatings: 0 });
    });

    it("should return default values and log error if database error occurs", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce({ userId: "orgMongoId123" })
        .mockResolvedValueOnce(null);

      mockRatings.aggregate.mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await ratingService.getAverageRating(organizationId);

      expect(logger.error).toHaveBeenCalled();
      expect(result).toEqual({ averageRating: 0, totalRatings: 0 });
    });

    it("should return default values if organization not found", async () => {
      mockOrganizations.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await ratingService.getAverageRating(organizationId);
      expect(result).toEqual({ averageRating: 0, totalRatings: 0 });
    });
  });
});
