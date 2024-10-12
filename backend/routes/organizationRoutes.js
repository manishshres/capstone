const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const authenticateToken = require("../middlewares/authenticateToken");

// Apply authentication and org account type check to all routes
router.use(authenticateToken, organizationController.checkOrgAccountType);

// Profile routes
router.post("/profile", organizationController.createOrUpdateProfile);
router.get("/profile", organizationController.getProfile);

module.exports = router;
