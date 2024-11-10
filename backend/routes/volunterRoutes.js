const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");
const { authenticate } = require("../middleware/auth");
const { checkRole } = require("../middleware/roles");

// Public routes
router.get("/jobs", volunteerController.getVolunteerJobs);
router.get("/jobs/:jobId", volunteerController.getVolunteerJobById);

// Volunteer routes
router.use(authenticate);
router.post(
  "/jobs/:jobId/apply",
  checkRole("volunteer"),
  volunteerController.applyForJob
);
router.get(
  "/applications",
  checkRole("volunteer"),
  volunteerController.getMyApplications
);
router.delete(
  "/applications/:jobId",
  checkRole("volunteer"),
  volunteerController.withdrawApplication
);

// Organization routes
router.post(
  "/jobs",
  checkRole("organization"),
  volunteerController.createVolunteerJob
);
router.put(
  "/jobs/:jobId",
  checkRole("organization"),
  volunteerController.updateVolunteerJob
);
router.put(
  "/jobs/:jobId/applications/:volunteerId/status",
  checkRole("organization"),
  volunteerController.updateApplicationStatus
);
router.get(
  "/organization/applications",
  checkRole("organization"),
  volunteerController.getOrganizationApplications
);
router.get(
  "/jobs/:jobId/stats",
  checkRole("organization"),
  volunteerController.getJobStats
);

module.exports = router;
