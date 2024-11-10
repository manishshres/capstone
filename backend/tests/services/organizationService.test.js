const { connectToDatabase } = require("../../config/mongoDbClient");
const organizationService = require("../../services/organizationService");

jest.mock("../../config/mongoDbClient");

describe("Organization Service - Service Requests", () => {
  let mockDb;
  let mockOrganizations;
  let mockServiceRequests;

  beforeEach(() => {
    mockServiceRequests = {
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(() => ({
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn(),
      })),
    };

    mockOrganizations = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === "organizations") return mockOrganizations;
        if (name === "serviceRequests") return mockServiceRequests;
        return null;
      }),
    };

    connectToDatabase.mockResolvedValue(mockDb);
  });

  describe("createServiceRequest", () => {
    const userId = "user123";
    const organizationId = "org123";
    const requestData = {
      serviceId: "service123",
      serviceName: "Test Service",
      serviceType: "food",
      description: "Test request",
      preferredContact: "email",
      contactDetails: {
        email: "test@example.com",
      },
    };

    it("should create service request successfully", async () => {
      const mockOrg = {
        services: {
          serviceList: [
            {
              id: "service123",
              name: "Test Service",
              type: "food",
            },
          ],
        },
      };

      mockOrganizations.findOne.mockResolvedValue(mockOrg);
      mockServiceRequests.insertOne.mockResolvedValue({
        insertedId: "request123",
      });

      const result = await organizationService.createServiceRequest(
        userId,
        organizationId,
        requestData
      );

      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        userId: organizationId,
      });

      expect(mockServiceRequests.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          organizationId,
          serviceId: requestData.serviceId,
          serviceName: requestData.serviceName,
          serviceType: requestData.serviceType,
          status: "pending",
          history: expect.arrayContaining([
            expect.objectContaining({
              status: "pending",
              note: "Request created",
              timestamp: expect.any(Date),
            }),
          ]),
        })
      );

      expect(result).toEqual({
        success: true,
        requestId: "request123",
        serviceDetails: expect.objectContaining({
          id: "service123",
          name: "Test Service",
          type: "food",
        }),
      });
    });

    it("should throw error if organization not found", async () => {
      mockOrganizations.findOne.mockResolvedValue(null);

      await expect(
        organizationService.createServiceRequest(
          userId,
          organizationId,
          requestData
        )
      ).rejects.toThrow("Organization not found");
    });

    it("should throw error if service not found", async () => {
      const mockOrg = {
        services: {
          serviceList: [
            {
              id: "different_service",
              name: "Different Service",
              type: "different",
            },
          ],
        },
      };

      mockOrganizations.findOne.mockResolvedValue(mockOrg);

      await expect(
        organizationService.createServiceRequest(
          userId,
          organizationId,
          requestData
        )
      ).rejects.toThrow("Service not found");
    });
  });

  describe("getServiceRequests", () => {
    const organizationId = "org123";

    it("should get service requests with filters", async () => {
      const mockRequests = [
        { _id: "request1", status: "pending" },
        { _id: "request2", status: "approved" },
      ];

      mockServiceRequests.find().toArray.mockResolvedValue(mockRequests);

      const result = await organizationService.getServiceRequests(
        organizationId,
        "pending",
        "food"
      );

      expect(mockServiceRequests.find).toHaveBeenCalledWith({
        organizationId,
        status: "pending",
        serviceType: "food",
      });

      expect(result).toEqual(
        mockRequests.map((request) =>
          expect.objectContaining({
            _id: request._id,
            status: request.status,
          })
        )
      );
    });

    it("should return empty array if no requests found", async () => {
      mockServiceRequests.find().toArray.mockResolvedValue([]);

      const result = await organizationService.getServiceRequests(
        organizationId
      );

      expect(result).toEqual([]);
    });
  });

  describe("updateServiceRequestStatus", () => {
    const organizationId = "org123";
    const requestId = "request123";
    const status = "approved";
    const notes = "Approved request";

    it("should update request status successfully", async () => {
      mockServiceRequests.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateServiceRequestStatus(
        organizationId,
        requestId,
        status,
        notes
      );

      expect(mockServiceRequests.updateOne).toHaveBeenCalledWith(
        {
          organizationId,
          _id: requestId,
        },
        {
          $set: {
            status,
            notes,
            updatedAt: expect.any(Date),
          },
          $push: {
            history: expect.objectContaining({
              status,
              note: notes,
              timestamp: expect.any(Date),
            }),
          },
        }
      );

      expect(result).toBe(true);
    });

    it("should return false if request not found", async () => {
      mockServiceRequests.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await organizationService.updateServiceRequestStatus(
        organizationId,
        requestId,
        status,
        notes
      );

      expect(result).toBe(false);
    });
  });

  describe("respondToServiceRequest", () => {
    const organizationId = "org123";
    const requestId = "request123";
    const responseData = {
      response: "We can help",
      availabilityDate: "2024-12-01",
      additionalInfo: "Please bring ID",
    };

    it("should add response to request successfully", async () => {
      const mockRequest = {
        _id: requestId,
        serviceId: "service123",
        serviceName: "Test Service",
        serviceType: "food",
      };

      mockServiceRequests.findOne.mockResolvedValue(mockRequest);
      mockServiceRequests.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.respondToServiceRequest(
        organizationId,
        requestId,
        responseData
      );

      expect(mockServiceRequests.updateOne).toHaveBeenCalledWith(
        {
          organizationId,
          _id: requestId,
        },
        expect.objectContaining({
          $set: expect.objectContaining({
            responseData: expect.objectContaining({
              ...responseData,
              updatedAt: expect.any(Date),
            }),
          }),
          $push: {
            history: expect.objectContaining({
              note: "Response added to request",
              responseDetails: responseData,
            }),
          },
        })
      );

      expect(result).toBe(true);
    });

    it("should return false if request not found", async () => {
      mockServiceRequests.findOne.mockResolvedValue(null);

      const result = await organizationService.respondToServiceRequest(
        organizationId,
        requestId,
        responseData
      );

      expect(result).toBe(false);
    });
  });
});
