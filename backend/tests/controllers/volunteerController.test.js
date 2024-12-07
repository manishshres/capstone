const volunteerController = require("../../controllers/volunteerController");
const volunteerService = require("../../services/volunteerService");
const { logger } = require("../../utils/logger");

jest.mock("../../services/volunteerService");
jest.mock("../../utils/logger");

describe("Volunteer Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        userId: "org123", // Default to an organization user for tests that require org actions
        accountType: "org",
      },
      params: {},
      query: {},
      body: {
        title: "Test Job",
        description: "Test Description",
        type: "oneTime",
        date: "2024-12-01",
        spots: "10",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("checkOrgAccount", () => {
    it("should call next if user is org", () => {
      const next = jest.fn();
      volunteerController.checkOrgAccount(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user is not org", () => {
      req.user.accountType = "user";
      const next = jest.fn();
      volunteerController.checkOrgAccount(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only organization accounts can access this resource",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("checkUserAccount", () => {
    it("should call next if user is user", () => {
      req.user.accountType = "user";
      const next = jest.fn();
      volunteerController.checkUserAccount(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user is not user", () => {
      req.user.accountType = "org";
      const next = jest.fn();
      volunteerController.checkUserAccount(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only users accounts can access this resource",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("createVolunteerJob", () => {
    it("should create a volunteer job successfully", async () => {
      const mockResult = {
        success: true,
        jobId: "job123",
        job: {
          title: "Test Job",
          description: "Test Description",
          spots: { total: 10, available: 10 },
        },
      };

      volunteerService.createVolunteerJob.mockResolvedValue(mockResult);

      await volunteerController.createVolunteerJob(req, res);

      expect(volunteerService.createVolunteerJob).toHaveBeenCalledWith(
        "org123",
        expect.objectContaining({
          title: "Test Job",
          description: "Test Description",
          type: "oneTime",
          date: "2024-12-01",
          spots: "10",
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Volunteer job created by organization")
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Volunteer job created successfully",
        job: mockResult.job,
      });
    });

    it("should validate required fields", async () => {
      delete req.body.title;

      await volunteerController.createVolunteerJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
      });
      expect(volunteerService.createVolunteerJob).not.toHaveBeenCalled();
    });

    it("should handle internal server error", async () => {
      volunteerService.createVolunteerJob.mockRejectedValue(
        new Error("Database error")
      );

      await volunteerController.createVolunteerJob(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error creating volunteer job:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create volunteer job",
      });
    });
  });

  describe("getVolunteerJobs", () => {
    it("should get jobs with filters", async () => {
      const mockJobs = [
        { _id: "job1", title: "Job 1" },
        { _id: "job2", title: "Job 2" },
      ];

      req.query = {
        city: "Test City",
        type: "oneTime",
        skills: "skill1,skill2",
      };

      volunteerService.getVolunteerJobs.mockResolvedValue(mockJobs);

      await volunteerController.getVolunteerJobs(req, res);

      expect(volunteerService.getVolunteerJobs).toHaveBeenCalledWith({
        city: "Test City",
        type: "oneTime",
        skills: ["skill1", "skill2"],
      });
      expect(res.json).toHaveBeenCalledWith({
        jobs: mockJobs,
        count: 2,
      });
    });

    it("should handle error fetching jobs", async () => {
      volunteerService.getVolunteerJobs.mockRejectedValue(
        new Error("Database error")
      );

      await volunteerController.getVolunteerJobs(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching volunteer jobs:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch volunteer jobs",
      });
    });
  });

  describe("applyForJob", () => {
    beforeEach(() => {
      // Switch to a user account type for applying to a job
      req.user = { userId: "user123", accountType: "user" };
      req.params.jobId = "job123";
      req.body = {
        message: "I'm interested",
        availability: "Full-time",
      };
    });

    it("should apply for a job successfully", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        spots: { available: 5 },
        applications: [],
      });
      volunteerService.applyForJob.mockResolvedValue({
        success: true,
        application: {
          volunteerId: "user123",
          status: "pending",
        },
      });

      await volunteerController.applyForJob(req, res);

      expect(volunteerService.applyForJob).toHaveBeenCalledWith(
        "job123",
        "user123",
        expect.objectContaining({
          message: "I'm interested",
          availability: "Full-time",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Application submitted successfully",
        application: expect.any(Object),
      });
    });

    it("should handle job not found", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue(null);

      await volunteerController.applyForJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Job not found",
      });
    });

    it("should handle no spots available", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        spots: { available: 0 },
      });

      await volunteerController.applyForJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No spots available for this job",
      });
    });
  });

  describe("updateApplicationStatus", () => {
    beforeEach(() => {
      // Organization user for updating application status
      req.user = { userId: "org123", accountType: "org" };
      req.params = {
        jobId: "job123",
        volunteerId: "vol123",
      };
      req.body = {
        status: "approved",
      };
    });

    it("should update status successfully", async () => {
      const mockJob = {
        _id: "job123",
        organizationId: "org123",
      };

      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);
      volunteerService.updateApplicationStatus.mockResolvedValue({
        success: true,
        modifiedCount: 1,
      });

      await volunteerController.updateApplicationStatus(req, res);

      expect(volunteerService.updateApplicationStatus).toHaveBeenCalledWith(
        "job123",
        "vol123",
        "approved"
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Application status updated")
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Application status updated successfully",
        result: expect.any(Object),
      });
    });

    it("should validate status value", async () => {
      const mockJob = {
        _id: "job123",
        organizationId: "org123",
      };

      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);
      req.body.status = "invalid";

      await volunteerController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid status",
      });
    });

    it("should handle unauthorized update", async () => {
      const mockJob = {
        _id: "job123",
        organizationId: "different_org",
      };

      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);

      await volunteerController.updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized to update this application",
      });
    });
  });

  describe("updateVolunteerJob", () => {
    beforeEach(() => {
      req.params.jobId = "job123";
      req.body = {
        title: "Updated Title",
        description: "Updated Description",
        date: "2025-01-01",
        spots: "5",
      };
    });

    it("should update volunteer job successfully", async () => {
      const mockJob = { _id: "job123", organizationId: "org123" };
      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);
      volunteerService.updateVolunteerJob.mockResolvedValue({
        modifiedCount: 1,
      });

      await volunteerController.updateVolunteerJob(req, res);

      expect(volunteerService.getVolunteerJobById).toHaveBeenCalledWith(
        "job123"
      );
      expect(volunteerService.updateVolunteerJob).toHaveBeenCalledWith(
        "job123",
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Volunteer job updated successfully",
        job: { modifiedCount: 1 },
      });
    });

    it("should return 404 if job not found", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue(null);

      await volunteerController.updateVolunteerJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should return 403 if user not owner of job", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        organizationId: "another_org",
      });

      await volunteerController.updateVolunteerJob(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized to update this job",
      });
    });

    it("should handle internal server error", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        organizationId: "org123",
      });
      volunteerService.updateVolunteerJob.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.updateVolunteerJob(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating volunteer job:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update volunteer job",
      });
    });
  });

  describe("getVolunteerJobById", () => {
    it("should return a job if found", async () => {
      req.params.jobId = "job123";
      const mockJob = { _id: "job123", title: "Job Title" };
      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);

      await volunteerController.getVolunteerJobById(req, res);

      expect(volunteerService.getVolunteerJobById).toHaveBeenCalledWith(
        "job123"
      );
      expect(res.json).toHaveBeenCalledWith(mockJob);
    });

    it("should return 404 if job not found", async () => {
      req.params.jobId = "job123";
      volunteerService.getVolunteerJobById.mockResolvedValue(null);

      await volunteerController.getVolunteerJobById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should handle internal server error", async () => {
      req.params.jobId = "job123";
      volunteerService.getVolunteerJobById.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.getVolunteerJobById(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching volunteer job:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch volunteer job",
      });
    });
  });

  describe("getPostedVolunteerJobs", () => {
    it("should return posted jobs", async () => {
      const mockJobs = [{ _id: "job1" }, { _id: "job2" }];
      volunteerService.getPostedVolunteerJobs.mockResolvedValue(mockJobs);

      await volunteerController.getPostedVolunteerJobs(req, res);

      expect(volunteerService.getPostedVolunteerJobs).toHaveBeenCalledWith(
        "org123"
      );
      expect(res.json).toHaveBeenCalledWith({
        jobs: mockJobs,
        count: 2,
      });
    });

    it("should handle error fetching posted jobs", async () => {
      volunteerService.getPostedVolunteerJobs.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.getPostedVolunteerJobs(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching posted volunteer jobs:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch volunteer jobs",
      });
    });
  });

  describe("getMyApplications", () => {
    beforeEach(() => {
      req.user = { userId: "user123", accountType: "user" };
    });

    it("should return applications for the current user", async () => {
      const mockApplications = [{ applicationId: "app1" }];
      volunteerService.getVolunteerApplications.mockResolvedValue(
        mockApplications
      );

      await volunteerController.getMyApplications(req, res);

      expect(volunteerService.getVolunteerApplications).toHaveBeenCalledWith(
        "user123"
      );
      expect(res.json).toHaveBeenCalledWith(mockApplications);
    });

    it("should handle errors fetching applications", async () => {
      volunteerService.getVolunteerApplications.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.getMyApplications(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching volunteer applications:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch applications",
      });
    });
  });

  describe("getOrganizationApplications", () => {
    it("should return organization applications", async () => {
      const mockApps = [{ _id: "app1" }];
      volunteerService.getOrganizationApplications.mockResolvedValue(mockApps);

      req.query = { status: "pending", jobId: "job123" };

      await volunteerController.getOrganizationApplications(req, res);

      expect(volunteerService.getOrganizationApplications).toHaveBeenCalledWith(
        {
          organizationId: "org123",
          status: "pending",
          jobId: "job123",
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockApps);
    });

    it("should handle errors fetching organization applications", async () => {
      volunteerService.getOrganizationApplications.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.getOrganizationApplications(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching organization applications:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch applications",
      });
    });
  });

  describe("withdrawApplication", () => {
    beforeEach(() => {
      req.params.jobId = "job123";
      req.user = { userId: "user123", accountType: "user" };
    });

    it("should withdraw an application successfully", async () => {
      const mockResult = { success: true };
      volunteerService.withdrawApplication.mockResolvedValue(mockResult);

      await volunteerController.withdrawApplication(req, res);

      expect(volunteerService.withdrawApplication).toHaveBeenCalledWith(
        "job123",
        "user123"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Application withdrawn successfully",
        result: mockResult,
      });
    });

    it("should handle errors withdrawing application", async () => {
      volunteerService.withdrawApplication.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.withdrawApplication(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error withdrawing application:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to withdraw application",
      });
    });
  });

  describe("getJobStats", () => {
    beforeEach(() => {
      req.params.jobId = "job123";
    });

    it("should return job stats if organization owns the job", async () => {
      const mockJob = { _id: "job123", organizationId: "org123" };
      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);

      const mockStats = { totalApplicants: 10, approved: 5 };
      volunteerService.getJobStats = jest.fn().mockResolvedValue(mockStats);

      await volunteerController.getJobStats(req, res);

      expect(volunteerService.getVolunteerJobById).toHaveBeenCalledWith(
        "job123"
      );
      expect(volunteerService.getJobStats).toHaveBeenCalledWith("job123");
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it("should return 404 if job not found or not owned by org", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue(null);

      await volunteerController.getJobStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should handle errors fetching job stats", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        organizationId: "org123",
      });
      volunteerService.getJobStats.mockRejectedValue(new Error("DB error"));

      await volunteerController.getJobStats(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching job stats:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch job statistics",
      });
    });
  });

  describe("getOrganizationVolunteers", () => {
    it("should return volunteers associated with the organization", async () => {
      const mockVolunteers = [{ _id: "vol1" }, { _id: "vol2" }];
      volunteerService.getOrganizationVolunteers.mockResolvedValue(
        mockVolunteers
      );

      await volunteerController.getOrganizationVolunteers(req, res);

      expect(volunteerService.getOrganizationVolunteers).toHaveBeenCalledWith(
        "org123"
      );
      expect(res.json).toHaveBeenCalledWith({
        volunteers: mockVolunteers,
        count: 2,
      });
    });

    it("should handle errors fetching organization volunteers", async () => {
      volunteerService.getOrganizationVolunteers.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.getOrganizationVolunteers(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching organization volunteers:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch volunteers",
      });
    });
  });

  describe("updateVolunteerHours", () => {
    beforeEach(() => {
      req.params = { jobId: "job123", volunteerId: "vol123" };
      req.body = { hours: 5 };
    });

    it("should return 403 if org does not own the job", async () => {
      const mockJob = { _id: "job123", organizationId: "otherOrg" };
      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);

      await volunteerController.updateVolunteerHours(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized to update volunteer hours",
      });
    });

    it("should handle errors updating volunteer hours", async () => {
      volunteerService.getVolunteerJobById.mockResolvedValue({
        _id: "job123",
        organizationId: "org123",
      });
      volunteerService.updateVolunteerHours.mockRejectedValue(
        new Error("DB error")
      );

      await volunteerController.updateVolunteerHours(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating volunteer hours:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update volunteer hours",
      });
    });
  });
});
