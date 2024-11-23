const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const ratingController = require("../controllers/ratingController");
const authenticateToken = require("../middlewares/authenticateToken");

// Apply authentication and org account type check to all routes
router.use(authenticateToken);

// Profile routes
router.get("/profile", organizationController.getOrganizationProfile);
router.put("/profile", organizationController.updateOrganizationProfile);

// Services routes
router.get("/services", organizationController.getOrganizationServices);
router.put("/services", organizationController.updateOrganizationServices);

// Inventory routes
router.get("/inventory", organizationController.getOrganizationInventory);
router.put("/inventory", organizationController.updateOrganizationInventory);

router.get("/:id", organizationController.getOrganizationById);

// router.post("/request", organizationController.createServiceRequest);

// router.get("/requests", organizationController.getServiceRequests);
// router.get(
//   "/requests/:requestId",
//   organizationController.getServiceRequestById
// );
// router.patch(
//   "/requests/:requestId/status",
//   organizationController.updateServiceRequestStatus
// );

// Public routes (require authentication but not org account)
// router.post(
//   "/service-requests/:serviceRequestId/rate",
//   ratingController.createRating
// );
// router.get(
//   "/organizations/:organizationId/ratings",
//   ratingController.getOrganizationRatings
// );
// router.get(
//   "/organizations/:organizationId/rating-stats",
//   ratingController.getOrganizationRatingStats
// );

// // Organization routes (require org account)
// router.use(checkOrgAccountType);
// router.post("/ratings/:ratingId/respond", ratingController.respondToRating);

module.exports = router;
