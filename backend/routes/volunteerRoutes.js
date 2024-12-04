const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");
const authenticateToken = require("../middlewares/authenticateToken");

// Public routes
router.get("/jobs", authenticateToken, volunteerController.getVolunteerJobs);
router.get(
  "/jobs/:jobId",
  authenticateToken,
  volunteerController.getVolunteerJobById
);

// Volunteer routes
router.post(
  "/jobs/:jobId/apply",
  authenticateToken,
  volunteerController.checkUserAccount,
  volunteerController.applyForJob
);
router.get(
  "/applications",
  authenticateToken,
  volunteerController.checkUserAccount,
  volunteerController.getMyApplications
);
router.delete(
  "/applications/:jobId",
  authenticateToken,
  volunteerController.checkUserAccount,
  volunteerController.withdrawApplication
);

// Organization routes
router.post(
  "/jobs",
  authenticateToken,
  volunteerController.checkOrgAccount,
  volunteerController.createVolunteerJob
);
router.put(
  "/jobs/:jobId",
  authenticateToken,
  volunteerController.checkOrgAccount,
  volunteerController.updateVolunteerJob
);

router.put(
  "/jobs/:jobId/applications/:volunteerId/status",
  authenticateToken,
  volunteerController.checkOrgAccount,
  volunteerController.updateApplicationStatus
);

router.get(
  "/organization/applications",
  authenticateToken,
  volunteerController.checkOrgAccount,
  volunteerController.getOrganizationApplications
);

router.get(
  "/jobs/:jobId/stats",
  authenticateToken,
  volunteerController.checkOrgAccount,
  volunteerController.getJobStats
);

module.exports = router;
