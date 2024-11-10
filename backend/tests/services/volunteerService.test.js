const volunteerService = require("../../services/volunteerService");
const { connectToDatabase } = require("../../config/mongoDbClient");

jest.mock("../../config/mongoDbClient");

describe("Volunteer Service", () => {
  let mockVolunteerJobs;
  let mockDb;

  beforeEach(() => {
    mockVolunteerJobs = {
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockVolunteerJobs),
    };

    connectToDatabase.mockResolvedValue(mockDb);
  });

  describe("createVolunteerJob", () => {
    const organizationId = "org123";
    const jobData = {
      title: "Test Job",
      description: "Test Description",
      type: "oneTime",
      date: "2024-12-01",
      spots: "10",
      location: "Test Location",
      address: "123 Test St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
    };

    it("should create a new volunteer job successfully", async () => {
      const mockInsertedId = "job123";
      mockVolunteerJobs.insertOne.mockResolvedValue({
        insertedId: mockInsertedId,
      });

      const result = await volunteerService.createVolunteerJob(
        organizationId,
        jobData
      );

      expect(result).toEqual({
        success: true,
        jobId: mockInsertedId,
        job: expect.objectContaining({
          organizationId,
          title: jobData.title,
          spots: {
            total: 10,
            available: 10,
            filled: 0,
          },
          status: "active",
        }),
      });

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
      expect(mockVolunteerJobs.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          title: jobData.title,
          description: jobData.description,
          type: jobData.type,
          date: expect.any(Date),
          status: "active",
          spots: {
            total: 10,
            available: 10,
            filled: 0,
          },
        })
      );
    });
  });

  describe("getVolunteerJobs", () => {
    it("should get jobs with filters", async () => {
      const mockJobs = [
        { _id: "job1", title: "Job 1" },
        { _id: "job2", title: "Job 2" },
      ];

      mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

      const filters = {
        city: "Test City",
        type: "oneTime",
      };

      const result = await volunteerService.getVolunteerJobs(filters);

      expect(result).toEqual(mockJobs);
      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
      expect(mockVolunteerJobs.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          "location.city": expect.any(RegExp),
        })
      );
      expect(mockVolunteerJobs.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe("applyForJob", () => {
    const jobId = "job123";
    const volunteerId = "vol123";
    const applicationData = {
      message: "I'm interested",
    };

    it("should apply for job successfully", async () => {
      const mockJob = {
        _id: jobId,
        spots: { available: 5 },
      };

      mockVolunteerJobs.findOne.mockResolvedValue(mockJob);
      mockVolunteerJobs.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await volunteerService.applyForJob(
        jobId,
        volunteerId,
        applicationData
      );

      expect(result).toEqual({
        success: true,
        application: expect.objectContaining({
          volunteerId,
          status: "pending",
          message: "I'm interested",
          appliedAt: expect.any(Date),
        }),
      });

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
      expect(mockVolunteerJobs.findOne).toHaveBeenCalledTimes(1);
      expect(mockVolunteerJobs.updateOne).toHaveBeenCalledTimes(1);
    });

    it("should throw error if job not found", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue(null);

      await expect(
        volunteerService.applyForJob(jobId, volunteerId, applicationData)
      ).rejects.toThrow("Job not found");

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
    });

    it("should throw error if no spots available", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue({
        _id: jobId,
        spots: { available: 0 },
      });

      await expect(
        volunteerService.applyForJob(jobId, volunteerId, applicationData)
      ).rejects.toThrow("No spots available");

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
    });
  });

  describe("updateApplicationStatus", () => {
    const jobId = "job123";
    const volunteerId = "vol123";
    const status = "approved";

    it("should update application status successfully", async () => {
      mockVolunteerJobs.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await volunteerService.updateApplicationStatus(
        jobId,
        volunteerId,
        status
      );

      expect(result).toEqual({
        success: true,
        modifiedCount: 1,
      });

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
      expect(mockVolunteerJobs.updateOne).toHaveBeenCalledTimes(1);
    });
  });
});
