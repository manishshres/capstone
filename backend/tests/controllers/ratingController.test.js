const ratingController = require("../../controllers/ratingController");
const ratingService = require("../../services/ratingService");
const { logger } = require("../../utils/logger");

jest.mock("../../services/ratingService");
jest.mock("../../utils/logger");

describe("Rating Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "user123" },
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createRating", () => {
    beforeEach(() => {
      req.params.serviceRequestId = "request123";
      req.body = {
        rating: 5,
        feedback: "Great service!",
      };
    });

    it("should create rating successfully", async () => {
      const mockResult = { ratingId: "rating123" };
      ratingService.createRating.mockResolvedValue(mockResult);

      await ratingController.createRating(req, res);

      expect(ratingService.createRating).toHaveBeenCalledWith(
        "user123",
        "request123",
        expect.objectContaining({
          rating: 5,
          feedback: "Great service!",
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Rating created for service request")
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rating submitted successfully",
        ratingId: "rating123",
      });
    });

    it("should validate rating value", async () => {
      req.body.rating = 6;

      await ratingController.createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid rating. Must be a number between 1 and 5",
      });
    });

    it("should handle duplicate rating error", async () => {
      ratingService.createRating.mockRejectedValue(
        new Error("You have already rated this service")
      );

      await ratingController.createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "You have already rated this service",
      });
    });

    it("should handle service not found error", async () => {
      ratingService.createRating.mockRejectedValue(
        new Error("Service request not found")
      );

      await ratingController.createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service request not found",
      });
    });
  });

  describe("getOrganizationRatings", () => {
    beforeEach(() => {
      req.params.organizationId = "org123";
      req.query = { page: "1", limit: "10" };
    });

    it("should get ratings with pagination", async () => {
      const mockResult = {
        ratings: [{ _id: "rating1" }, { _id: "rating2" }],
        metadata: {
          total: 2,
          page: 1,
          totalPages: 1,
        },
      };
      ratingService.getOrganizationRatings.mockResolvedValue(mockResult);

      await ratingController.getOrganizationRatings(req, res);

      expect(ratingService.getOrganizationRatings).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("should handle rating range filters", async () => {
      req.query.minRating = "4";
      req.query.maxRating = "5";

      await ratingController.getOrganizationRatings(req, res);

      expect(ratingService.getOrganizationRatings).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          minRating: "4",
          maxRating: "5",
        })
      );
    });
  });

  describe("getOrganizationRatingStats", () => {
    beforeEach(() => {
      req.params.organizationId = "org123";
    });

    it("should get rating statistics", async () => {
      const mockStats = {
        averageRating: 4.5,
        totalRatings: 10,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 },
      };
      ratingService.getOrganizationRatingStats.mockResolvedValue(mockStats);

      await ratingController.getOrganizationRatingStats(req, res);

      expect(ratingService.getOrganizationRatingStats).toHaveBeenCalledWith(
        "org123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });
  });

  describe("respondToRating", () => {
    beforeEach(() => {
      req.user = { userId: "org123" };
      req.params.ratingId = "rating123";
      req.body = { response: "Thank you for your feedback!" };
    });

    it("should add response successfully", async () => {
      ratingService.respondToRating.mockResolvedValue(true);

      await ratingController.respondToRating(req, res);

      expect(ratingService.respondToRating).toHaveBeenCalledWith(
        "rating123",
        "org123",
        "Thank you for your feedback!"
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Response added to rating")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Response added successfully",
      });
    });

    it("should validate response text", async () => {
      req.body.response = "";

      await ratingController.respondToRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Response text is required",
      });
    });

    it("should handle rating not found", async () => {
      ratingService.respondToRating.mockResolvedValue(false);

      await ratingController.respondToRating(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating not found",
      });
    });
  });
});
