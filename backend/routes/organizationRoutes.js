const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const ratingController = require("../controllers/ratingController");
const authenticateToken = require("../middlewares/authenticateToken");

// Apply authentication and org account type check to all routes
router.use(authenticateToken);

router.get("/getById/:id", organizationController.getOrganizationById);

// Profile routes
router.put("/profile", organizationController.createOrUpdateProfile);
router.get("/profile", organizationController.getProfile);

// Services routes
router.put("/services", organizationController.updateServices);
router.get("/services", organizationController.getServices);

// Inventory routes
router.put("/inventory", organizationController.updateInventory);
router.get("/inventory", organizationController.getInventory);

router.post("/request", organizationController.createServiceRequest);

router.get("/requests", organizationController.getServiceRequests);
router.get(
  "/requests/:requestId",
  organizationController.getServiceRequestById
);
router.patch(
  "/requests/:requestId/status",
  organizationController.updateServiceRequestStatus
);

// Public routes (require authentication but not org account)
router.post(
  "/service-requests/:serviceRequestId/rate",
  ratingController.createRating
);
router.get(
  "/organizations/:organizationId/ratings",
  ratingController.getOrganizationRatings
);
router.get(
  "/organizations/:organizationId/rating-stats",
  ratingController.getOrganizationRatingStats
);

// Organization routes (require org account)
router.use(checkOrgAccountType);
router.post("/ratings/:ratingId/respond", ratingController.respondToRating);

module.exports = router;
