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
        id: "user123",
        organizationId: "org123",
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

  describe("createVolunteerJob", () => {
    it("should create volunteer job successfully", async () => {
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

      expect(volunteerService.getVolunteerJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          city: "Test City",
          type: "oneTime",
          skills: ["skill1", "skill2"],
        })
      );
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
      req.params.jobId = "job123";
      req.body = {
        message: "I'm interested",
        availability: "Full-time",
      };
    });

    it("should apply for job successfully", async () => {
      const mockJob = {
        _id: "job123",
        spots: { available: 5 },
      };

      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);
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
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("applied for job")
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
      const mockJob = {
        _id: "job123",
        spots: { available: 0 },
      };

      volunteerService.getVolunteerJobById.mockResolvedValue(mockJob);

      await volunteerController.applyForJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No spots available for this job",
      });
    });
  });

  describe("updateApplicationStatus", () => {
    beforeEach(() => {
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
});
