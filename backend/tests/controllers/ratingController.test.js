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
      req.params.id = "org123";
      req.body = {
        rating: 5,
        feedback: "Great service!",
      };
    });

    it("should create rating successfully", async () => {
      const mockRatingId = "rating123";
      ratingService.createRating.mockResolvedValue(mockRatingId);

      await ratingController.createRating(req, res);

      expect(ratingService.createRating).toHaveBeenCalledWith(
        "org123",
        "user123",
        expect.objectContaining({
          rating: 5,
          feedback: "Great service!",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rating created successfully",
      });
    });

    it("should handle organization not found error", async () => {
      ratingService.createRating.mockRejectedValue(
        new Error("Organization not found")
      );

      await ratingController.createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization not found",
      });
    });

    // it("should handle no support received error", async () => {
    //   ratingService.createRating.mockRejectedValue(
    //     new Error("You have not received support from this organization")
    //   );

    //   await ratingController.createRating(req, res);

    //   expect(res.status).toHaveBeenCalledWith(400);
    //   expect(res.json).toHaveBeenCalledWith({
    //     error: "You have not received support from this organization",
    //   });
    // });

    it("should handle unexpected errors", async () => {
      ratingService.createRating.mockRejectedValue(
        new Error("Unexpected error")
      );

      await ratingController.createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });

  describe("getRatingById", () => {
    beforeEach(() => {
      req.params.id = "rating123";
    });

    it("should get rating successfully", async () => {
      const mockRating = {
        id: "rating123",
        rating: 5,
        feedback: "Great service!",
      };
      ratingService.getRatingById.mockResolvedValue(mockRating);

      await ratingController.getRatingById(req, res);

      expect(ratingService.getRatingById).toHaveBeenCalledWith("rating123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRating);
    });

    it("should handle rating not found", async () => {
      ratingService.getRatingById.mockRejectedValue(
        new Error("Rating not found")
      );

      await ratingController.getRatingById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating not found",
      });
    });

    it("should handle unexpected errors", async () => {
      ratingService.getRatingById.mockRejectedValue(
        new Error("Unexpected error")
      );

      await ratingController.getRatingById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });

  describe("updateRating", () => {
    beforeEach(() => {
      req.params.id = "rating123";
      req.body = {
        rating: 4,
        feedback: "Updated feedback",
      };
    });

    it("should update rating successfully", async () => {
      ratingService.updateRating.mockResolvedValue();

      await ratingController.updateRating(req, res);

      expect(ratingService.updateRating).toHaveBeenCalledWith(
        "rating123",
        expect.objectContaining({
          rating: 4,
          feedback: "Updated feedback",
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rating updated successfully",
      });
    });

    it("should handle rating not found", async () => {
      ratingService.updateRating.mockRejectedValue(
        new Error("Rating not found")
      );

      await ratingController.updateRating(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Rating not found",
      });
    });

    it("should handle unexpected errors", async () => {
      ratingService.updateRating.mockRejectedValue(
        new Error("Unexpected error")
      );

      await ratingController.updateRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });

  describe("getRatings", () => {
    beforeEach(() => {
      req.params.id = "org123";
    });

    it("should get ratings successfully", async () => {
      const mockRatings = [
        { id: "rating1", rating: 5 },
        { id: "rating2", rating: 4 },
      ];
      ratingService.getRatings.mockResolvedValue(mockRatings);

      await ratingController.getRatings(req, res);

      expect(ratingService.getRatings).toHaveBeenCalledWith("org123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRatings);
    });

    it("should handle unexpected errors", async () => {
      ratingService.getRatings.mockRejectedValue(new Error("Unexpected error"));

      await ratingController.getRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });
});
