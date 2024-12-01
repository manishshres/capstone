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
  let mockSupports;

  beforeEach(() => {
    mockRatings = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      updateOne: jest.fn(),
    };

    mockOrganizations = {
      findOne: jest.fn(),
    };

    mockSupports = {
      findOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        switch (name) {
          case "ratings":
            return mockRatings;
          case "organizations":
            return mockOrganizations;
          case "supports":
            return mockSupports;
          default:
            return null;
        }
      }),
    };

    connectToDatabase.mockResolvedValue(mockDb);
  });

  describe("createRating", () => {
    const organizationId = "org123";
    const userId = "user123";
    const ratingData = {
      rating: 5,
      comment: "Great service!",
    };

    it("should create rating successfully", async () => {
      const mockInsertedId = new ObjectId();

      mockOrganizations.findOne.mockResolvedValue({ userId: organizationId });
      mockSupports.findOne.mockResolvedValue({ _id: "support123" });
      mockRatings.insertOne.mockResolvedValue({ insertedId: mockInsertedId });

      const result = await ratingService.createRating(
        organizationId,
        userId,
        ratingData
      );

      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        userId: organizationId,
      });
      expect(mockSupports.findOne).toHaveBeenCalledWith({
        userId,
        organizationId,
      });
      expect(mockRatings.insertOne).toHaveBeenCalledWith({
        organizationId,
        userId,
        rating: ratingData.rating,
        comment: ratingData.comment,
        createdAt: expect.any(Date),
      });
      expect(result).toEqual(mockInsertedId);
    });

    it("should throw error when organization not found", async () => {
      mockOrganizations.findOne.mockResolvedValue(null);

      await expect(
        ratingService.createRating(organizationId, userId, ratingData)
      ).rejects.toThrow("Organization not found");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error when user has not received support", async () => {
      mockOrganizations.findOne.mockResolvedValue({ userId: organizationId });
      mockSupports.findOne.mockResolvedValue(null);

      await expect(
        ratingService.createRating(organizationId, userId, ratingData)
      ).rejects.toThrow("You have not received support from this organization");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRatingById", () => {
    const ratingId = "507f1f77bcf86cd799439011"; // Valid ObjectId string

    it("should return rating when found", async () => {
      const mockRating = {
        _id: new ObjectId(ratingId),
        rating: 5,
        comment: "Great service!",
      };
      mockRatings.findOne.mockResolvedValue(mockRating);

      const result = await ratingService.getRatingById(ratingId);

      expect(mockRatings.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
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
    const ratingId = "507f1f77bcf86cd799439011";
    const updates = {
      rating: 4,
      comment: "Updated comment",
    };

    it("should update rating successfully", async () => {
      mockRatings.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await ratingService.updateRating(ratingId, updates);

      expect(mockRatings.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: updates }
      );
      expect(result).toBe(true);
    });

    it("should throw error when rating not found", async () => {
      mockRatings.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        ratingService.updateRating(ratingId, updates)
      ).rejects.toThrow("Rating not found");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error with invalid ObjectId", async () => {
      const invalidId = "invalid-id";

      await expect(
        ratingService.updateRating(invalidId, updates)
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRatings", () => {
    const organizationId = "org123";

    it("should return list of ratings", async () => {
      const mockRatingsList = [
        { _id: new ObjectId(), rating: 5, comment: "Great!" },
        { _id: new ObjectId(), rating: 4, comment: "Good" },
      ];
      mockRatings.find().toArray.mockResolvedValue(mockRatingsList);

      const result = await ratingService.getRatings(organizationId);

      expect(mockRatings.find).toHaveBeenCalledWith({ organizationId });
      expect(result).toEqual(mockRatingsList);
    });

    it("should return empty array when no ratings found", async () => {
      mockRatings.find().toArray.mockResolvedValue([]);

      const result = await ratingService.getRatings(organizationId);

      expect(mockRatings.find).toHaveBeenCalledWith({ organizationId });
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockRatings.find().toArray.mockRejectedValue(new Error("Database error"));

      await expect(ratingService.getRatings(organizationId)).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
