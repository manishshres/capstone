const ratingService = require("../services/ratingService");

exports.createRating = async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.userId;
    const ratingData = req.body;

    console.log(organizationId);
    console.log(userId);

    const ratingId = await ratingService.createRating(
      organizationId,
      userId,
      ratingData
    );
    res.status(201).json({ message: "Rating created successfully", ratingId });
  } catch (error) {
    if (
      error.message.includes("Organization not found") ||
      error.message.includes(
        "You have not received support from this organization"
      )
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getRatingById = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const rating = await ratingService.getRatingById(ratingId);
    res.status(200).json(rating);
  } catch (error) {
    if (error.message === "Rating not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.updateRating = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const updates = req.body;
    await ratingService.updateRating(ratingId, updates);
    res.status(200).json({ message: "Rating updated successfully" });
  } catch (error) {
    if (error.message === "Rating not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getRatings = async (req, res) => {
  try {
    const organizationId = req.params.id;
    const ratings = await ratingService.getRatings(organizationId);
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
