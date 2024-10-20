const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const authenticateToken = require("../middlewares/authenticateToken");

// Apply authentication and org account type check to all routes
router.use(authenticateToken, organizationController.checkOrgAccountType);

// Profile routes
router.put("/profile", organizationController.createOrUpdateProfile);
router.get("/profile", organizationController.getProfile);

// Services routes
router.put("/services", organizationController.updateServices);
router.get("/services", organizationController.getServices);

// Inventory routes
router.put("/inventory", organizationController.updateInventory);
router.get("/inventory", organizationController.getInventory);

module.exports = router;
