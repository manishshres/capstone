const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authenticateToken = require("../middlewares/authenticateToken");

router.use(authenticateToken);

router.get("/org/:id", ratingController.getRatings);
router.get("/org/:id/average", ratingController.getAverageRating);
router.post("/:id", ratingController.createRating);
router.get("/:id", ratingController.getRatingById);
router.put("/:id", ratingController.updateRating);

module.exports = router;
