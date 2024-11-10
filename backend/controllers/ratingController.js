const ratingService = require("../services/ratingService");
const { logger } = require("../utils/logger");

exports.createRating = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { serviceRequestId } = req.params;
    const ratingData = req.body;

    // Validate rating
    if (
      !ratingData.rating ||
      !Number.isInteger(ratingData.rating) ||
      ratingData.rating < 1 ||
      ratingData.rating > 5
    ) {
      return res.status(400).json({
        error: "Invalid rating. Must be a number between 1 and 5",
      });
    }

    const result = await ratingService.createRating(
      userId,
      serviceRequestId,
      ratingData
    );

    logger.info(
      `Rating created for service request ${serviceRequestId} by user ${userId}`
    );
    res.status(201).json({
      message: "Rating submitted successfully",
      ratingId: result.ratingId,
    });
  } catch (error) {
    logger.error("Error creating rating:", error);

    if (error.message === "Service request not found") {
      return res.status(404).json({ error: "Service request not found" });
    }
    if (error.message === "You have already rated this service") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to submit rating" });
  }
};

exports.getOrganizationRatings = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      minRating: req.query.minRating,
      maxRating: req.query.maxRating,
    };

    const result = await ratingService.getOrganizationRatings(
      organizationId,
      options
    );
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error fetching organization ratings:", error);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
};

exports.getOrganizationRatingStats = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const stats = await ratingService.getOrganizationRatingStats(
      organizationId
    );
    res.status(200).json(stats);
  } catch (error) {
    logger.error("Error fetching organization rating stats:", error);
    res.status(500).json({ error: "Failed to fetch rating statistics" });
  }
};

exports.respondToRating = async (req, res) => {
  try {
    const organizationId = req.user.userId;
    const { ratingId } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({
        error: "Response text is required",
      });
    }

    const result = await ratingService.respondToRating(
      ratingId,
      organizationId,
      response
    );

    if (!result) {
      return res.status(404).json({ error: "Rating not found" });
    }

    logger.info(
      `Response added to rating ${ratingId} by organization ${organizationId}`
    );
    res.status(200).json({
      message: "Response added successfully",
    });
  } catch (error) {
    logger.error("Error responding to rating:", error);
    res.status(500).json({ error: "Failed to add response" });
  }
};
