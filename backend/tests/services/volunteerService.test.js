const volunteerService = require("../../services/volunteerService");
const { connectToDatabase } = require("../../config/mongoDbClient");
const { ObjectId } = require("mongodb");

jest.mock("../../config/mongoDbClient");

describe("Volunteer Service", () => {
  let mockVolunteerJobs;
  let mockUsers;
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

    mockUsers = {
      findOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === "volunteerJobs") return mockVolunteerJobs;
        if (name === "users") return mockUsers;
        return null;
      }),
    };

    connectToDatabase.mockResolvedValue(mockDb);
    jest.clearAllMocks();
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
      const mockInsertedId = new ObjectId().toHexString();
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
          spots: expect.objectContaining({
            total: 10,
            available: 10,
            filled: 0,
          }),
          status: "active",
        }),
      });

      expect(mockDb.collection).toHaveBeenCalledWith("volunteerJobs");
    });
  });

  describe("updateVolunteerJob", () => {
    const jobId = new ObjectId().toHexString();
    const jobData = {
      title: "Updated Job",
      description: "Updated Description",
      type: "recurring",
      date: "2025-01-01",
      spots: "5",
      location: "Updated Location",
      address: "456 Updated Ave",
      city: "Updated City",
      state: "UP",
      zipCode: "67890",
    };

    it("should update a volunteer job successfully", async () => {
      mockVolunteerJobs.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await volunteerService.updateVolunteerJob(jobId, jobData);

      expect(result).toEqual({
        success: true,
        modifiedCount: 1,
      });

      expect(mockVolunteerJobs.updateOne).toHaveBeenCalledTimes(1);
    });

    it("should throw error for invalid ObjectId format", async () => {
      await expect(
        volunteerService.updateVolunteerJob("invalid-id", jobData)
      ).rejects.toThrow("Invalid ObjectId format: invalid-id");
    });
  });

  describe("getVolunteerJobById", () => {
    const jobId = new ObjectId().toHexString();
    const mockJob = {
      _id: ObjectId.createFromHexString(jobId),
      title: "Job 1",
    };

    it("should return a job by id", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue(mockJob);

      const result = await volunteerService.getVolunteerJobById(jobId);
      expect(result).toEqual(mockJob);
    });

    it("should return null if job not found", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue(null);

      const result = await volunteerService.getVolunteerJobById(jobId);
      expect(result).toBeNull();
    });

    it("should throw error for invalid ObjectId format", async () => {
      await expect(
        volunteerService.getVolunteerJobById("invalid-id")
      ).rejects.toThrow("Invalid ObjectId format: invalid-id");
    });
  });

  describe("getPostedVolunteerJobs", () => {
    it("should return posted volunteer jobs for an organization", async () => {
      const organizationId = "org123";
      const mockJobs = [{ _id: "job1" }, { _id: "job2" }];
      mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

      const result = await volunteerService.getPostedVolunteerJobs(
        organizationId
      );
      expect(result).toEqual(mockJobs);
      expect(mockVolunteerJobs.find).toHaveBeenCalledWith({ organizationId });
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
    const jobId = new ObjectId().toHexString();
    const volunteerId = "vol123";
    const applicationData = {
      message: "I'm interested",
    };

    it("should apply for job successfully", async () => {
      const mockJob = {
        _id: ObjectId.createFromHexString(new ObjectId().toHexString()),
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
    });

    it("should throw error if job not found", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue(null);

      await expect(
        volunteerService.applyForJob(jobId, volunteerId, applicationData)
      ).rejects.toThrow("Job not found");
    });

    it("should throw error if no spots available", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue({
        _id: ObjectId.createFromHexString(new ObjectId().toHexString()),
        spots: { available: 0 },
      });

      await expect(
        volunteerService.applyForJob(jobId, volunteerId, applicationData)
      ).rejects.toThrow("No spots available");
    });
  });

  describe("updateApplicationStatus", () => {
    const jobId = new ObjectId().toHexString();
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
    });
  });

  describe("withdrawApplication", () => {
    const jobId = new ObjectId().toHexString();
    const volunteerId = "vol123";

    it("should withdraw application successfully", async () => {
      const mockJob = {
        _id: ObjectId.createFromHexString(jobId),
        applications: [{ volunteerId }],
      };

      mockVolunteerJobs.findOne.mockResolvedValue(mockJob);
      mockVolunteerJobs.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await volunteerService.withdrawApplication(
        jobId,
        volunteerId
      );

      expect(result).toEqual({
        success: true,
        result: expect.any(Object),
      });
    });

    it("should throw error if application not found", async () => {
      mockVolunteerJobs.findOne.mockResolvedValue(null);

      await expect(
        volunteerService.withdrawApplication(jobId, volunteerId)
      ).rejects.toThrow("Application not found");
    });
  });

  describe("getVolunteerApplications", () => {
    const volunteerId = "vol123";

    it("should return volunteer applications", async () => {
      const mockJobs = [
        {
          _id: new ObjectId(),
          title: "Job 1",
          description: "Desc 1",
          date: new Date(),
          startTime: "09:00",
          endTime: "17:00",
          location: { city: "City1" },
          organizationId: "org123",
          contact: { name: "Org Contact", email: "org@example.com" },
          applications: [
            {
              volunteerId,
              status: "pending",
              appliedAt: new Date(),
              motivationLetter: "I am motivated",
            },
          ],
        },
      ];

      mockVolunteerJobs.find.mockReturnThis();
      mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

      const result = await volunteerService.getVolunteerApplications(
        volunteerId
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          status: "pending",
          motivationLetter: "I am motivated",
        })
      );
    });
  });

  describe("getOrganizationApplications", () => {
    const organizationId = "org123";

    it("should return organization applications", async () => {
      const mockVolunteerId = "vol123";
      const mockJobs = [
        {
          _id: new ObjectId(),
          title: "Job Org",
          description: "Desc Org",
          date: new Date(),
          location: { city: "CityOrg" },
          organizationId,
          applications: [
            {
              volunteerId: mockVolunteerId,
              status: "pending",
              appliedAt: new Date(),
              motivationLetter: "Motivation",
            },
          ],
        },
      ];
      const mockUser = {
        _id: mockVolunteerId,
        name: "Volunteer",
        email: "vol@example.com",
      };

      mockVolunteerJobs.find.mockReturnThis();
      mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);
      mockUsers.findOne.mockResolvedValue(mockUser);

      const result = await volunteerService.getOrganizationApplications({
        organizationId,
      });
      expect(result).toHaveLength(1);
      expect(result[0].volunteer).toEqual(
        expect.objectContaining({
          name: "Volunteer",
          email: "vol@example.com",
        })
      );
    });
  });

  describe("updateVolunteerHours", () => {
    const jobId = new ObjectId().toHexString();
    const volunteerId = "vol123";
    const hours = 5;

    it("should update volunteer hours successfully", async () => {
      mockVolunteerJobs.updateOne.mockResolvedValue({ matchedCount: 1 });

      const result = await volunteerService.updateVolunteerHours(
        jobId,
        volunteerId,
        hours
      );
      expect(result).toEqual({ success: true, result: { matchedCount: 1 } });
    });

    it("should handle errors", async () => {
      mockVolunteerJobs.updateOne.mockRejectedValue(new Error("DB error"));

      await expect(
        volunteerService.updateVolunteerHours(jobId, volunteerId, hours)
      ).rejects.toThrow("DB error");
    });
  });
  describe("Volunteer Service - Additional Tests", () => {
    let mockVolunteerJobs;
    let mockUsers;
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

      mockUsers = {
        findOne: jest.fn(),
      };

      mockDb = {
        collection: jest.fn((name) => {
          if (name === "volunteerJobs") return mockVolunteerJobs;
          if (name === "users") return mockUsers;
          return null;
        }),
      };

      connectToDatabase.mockResolvedValue(mockDb);
      jest.clearAllMocks();
    });

    describe("createVolunteerJob Edge Cases", () => {
      it("should throw an error if date is invalid", async () => {
        const organizationId = "org123";
        const jobData = {
          title: "Invalid Date Job",
          description: "Some desc",
          type: "oneTime",
          date: "not-a-real-date",
          spots: "5",
        };

        await expect(
          volunteerService.createVolunteerJob(organizationId, jobData)
        ).rejects.toThrow();
      });

      it("should create job with minimal data (no optional fields)", async () => {
        const organizationId = "org123";
        const jobData = {
          title: "Minimal Job",
          description: "Just a description",
          type: "oneTime",
          date: "2024-12-01",
          spots: "2",
        };

        const mockInsertedId = new ObjectId();
        mockVolunteerJobs.insertOne.mockResolvedValue({
          insertedId: mockInsertedId,
        });

        const result = await volunteerService.createVolunteerJob(
          organizationId,
          jobData
        );

        expect(result.success).toBe(true);
        expect(result.jobId).toEqual(mockInsertedId);
        expect(result.job.spots.total).toBe(2);
        expect(result.job.spots.available).toBe(2);
        expect(result.job.status).toBe("active");
      });
    });

    describe("updateVolunteerJob Additional Tests", () => {
      it("should handle updating with no changes gracefully", async () => {
        const jobId = new ObjectId().toHexString();
        const jobData = {
          title: "Same Title",
          description: "Same Desc",
          type: "oneTime",
          date: "2025-01-01",
          spots: "10",
        };

        // If nothing changes, MongoDB might still report modifiedCount = 1 if it sets the same values.
        mockVolunteerJobs.updateOne.mockResolvedValue({ modifiedCount: 0 });
        const result = await volunteerService.updateVolunteerJob(
          jobId,
          jobData
        );
        expect(result.success).toBe(true);
        expect(result.modifiedCount).toBe(0);
      });
    });

    describe("getVolunteerJobs Additional Tests", () => {
      it("should filter jobs by state", async () => {
        const mockJobs = [
          { _id: "job1", title: "Job in State", location: { state: "TS" } },
        ];

        mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

        const filters = { state: "TS" };
        const result = await volunteerService.getVolunteerJobs(filters);

        expect(result).toEqual(mockJobs);
        expect(mockVolunteerJobs.find).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "active",
            "location.state": "TS",
          })
        );
      });

      it("should filter jobs by skills", async () => {
        const mockJobs = [
          {
            _id: "jobSkill",
            title: "Skilled Job",
            skills: ["cooking", "cleaning"],
          },
        ];

        mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

        const filters = { skills: ["cooking"] };
        const result = await volunteerService.getVolunteerJobs(filters);
        expect(result).toEqual(mockJobs);
        expect(mockVolunteerJobs.find).toHaveBeenCalledWith({
          status: "active",
          skills: { $in: ["cooking"] },
        });
      });

      it("should filter jobs by date", async () => {
        const mockJobs = [
          {
            _id: "futureJob",
            title: "Future Job",
            date: new Date("2025-12-31"),
          },
        ];

        mockVolunteerJobs.toArray.mockResolvedValue(mockJobs);

        const filters = { date: "2025-01-01" };
        const result = await volunteerService.getVolunteerJobs(filters);
        // Only jobs on or after 2025-01-01 should be returned
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe("Future Job");
        expect(mockVolunteerJobs.find).toHaveBeenCalledWith({
          status: "active",
          date: { $gte: new Date("2025-01-01") },
        });
      });
    });

    describe("applyForJob Additional Tests", () => {
      const jobId = new ObjectId().toHexString();
      const volunteerId = "vol123";
      const applicationData = { message: "Interested" };

      it("should throw error if no jobId or volunteerId or applicationData provided", async () => {
        await expect(
          volunteerService.applyForJob(null, volunteerId, applicationData)
        ).rejects.toThrow("Invalid input parameters");

        await expect(
          volunteerService.applyForJob(jobId, null, applicationData)
        ).rejects.toThrow("Invalid input parameters");

        await expect(
          volunteerService.applyForJob(jobId, volunteerId, null)
        ).rejects.toThrow("Invalid input parameters");
      });
    });

    describe("updateVolunteerHours Additional Tests", () => {
      const jobId = new ObjectId().toHexString();
      const volunteerId = "vol123";

      it("should handle updating hours for a volunteer who has not applied", async () => {
        mockVolunteerJobs.updateOne.mockResolvedValue({ matchedCount: 0 });

        const result = await volunteerService.updateVolunteerHours(
          jobId,
          volunteerId,
          10
        );
        // matchedCount=0 means no update occurred
        expect(result.success).toBe(true);
        expect(result.result.matchedCount).toBe(0);
      });
    });

    describe("getOrganizationVolunteers Additional Tests", () => {
      it("should return an empty array if no volunteers found", async () => {
        const organizationId = "orgNoVols";
        mockVolunteerJobs.find.mockReturnThis();
        mockVolunteerJobs.toArray.mockResolvedValue([
          {
            _id: new ObjectId(),
            applications: [
              { volunteerId: "volX", status: "pending" },
              { volunteerId: "volY", status: "rejected" },
            ],
          },
        ]);

        // No approved volunteers
        const result = await volunteerService.getOrganizationVolunteers(
          organizationId
        );
        expect(result).toEqual([]);
      });
    });
  });
});
