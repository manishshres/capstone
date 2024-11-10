const organizationController = require("../../controllers/organizationController");
const organizationService = require("../../services/organizationService");
const jwt = require("jsonwebtoken");
const { logger } = require("../../utils/logger");

jest.mock("../../services/organizationService");
jest.mock("jsonwebtoken");
jest.mock("../../utils/logger");

describe("Organization Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "123" },
      params: { id: "123" },
      body: {
        name: "Test Organization",
        description: "Test description",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getOrganizationById", () => {
    it("should retrieve organization by ID successfully", async () => {
      const mockOrganization = {
        id: "123",
        name: "Test Organization",
        description: "Test description",
      };
      organizationService.getOrganizationById.mockResolvedValue(
        mockOrganization
      );

      await organizationController.getOrganizationById(req, res);

      expect(organizationService.getOrganizationById).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrganization);
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to retrieve organization by ID: 123"
      );
    });

    it("should handle organization not found", async () => {
      organizationService.getOrganizationById.mockResolvedValue(null);

      await organizationController.getOrganizationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization not found",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.getOrganizationById.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.getOrganizationById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("createOrUpdateProfile", () => {
    it("should create or update organization profile successfully", async () => {
      const mockProfile = {
        id: "123",
        name: "Test Organization",
        description: "Test description",
      };
      organizationService.createOrUpdateProfile.mockResolvedValue(mockProfile);
      jwt.sign.mockReturnValue("fake-token");

      await organizationController.createOrUpdateProfile(req, res);

      expect(organizationService.createOrUpdateProfile).toHaveBeenCalledWith(
        "123",
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Organization profile created/updated successfully",
        profile: mockProfile,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to create/update organization profile for user: 123"
      );
    });

    it("should handle profile creation/update errors", async () => {
      organizationService.createOrUpdateProfile.mockResolvedValue({
        error: "Failed to create/update profile",
      });

      await organizationController.createOrUpdateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create/update profile",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.createOrUpdateProfile.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.createOrUpdateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getProfile", () => {
    it("should retrieve organization profile successfully", async () => {
      const mockProfile = {
        id: "123",
        name: "Test Organization",
        description: "Test description",
      };
      organizationService.getOrganizationProfile.mockResolvedValue(mockProfile);

      await organizationController.getProfile(req, res);

      expect(organizationService.getOrganizationProfile).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to retrieve organization profile for user: 123"
      );
    });

    it("should handle profile not found", async () => {
      organizationService.getOrganizationProfile.mockResolvedValue(null);

      await organizationController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Profile not found" });
    });

    it("should handle unexpected errors", async () => {
      organizationService.getOrganizationProfile.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateServices", () => {
    it("should update organization services successfully", async () => {
      const mockServices = {
        description: "Test service description",
        serviceList: ["Service 1", "Service 2"],
      };
      organizationService.updateServices.mockResolvedValue(mockServices);

      await organizationController.updateServices(req, res);

      expect(organizationService.updateServices).toHaveBeenCalledWith(
        "123",
        mockServices
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Services updated successfully",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to update organization services for user: 123"
      );
    });

    it("should handle service update errors", async () => {
      organizationService.updateServices.mockResolvedValue({
        error: "Failed to update services",
      });

      await organizationController.updateServices(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update services",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.updateServices.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.updateServices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServices", () => {
    it("should retrieve organization services successfully", async () => {
      const mockServices = {
        description: "Test service description",
        serviceList: ["Service 1", "Service 2"],
      };
      organizationService.getOrganizationServices.mockResolvedValue(
        mockServices
      );

      await organizationController.getServices(req, res);

      expect(organizationService.getOrganizationServices).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockServices);
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to retrieve organization services for user: 123"
      );
    });

    it("should handle services not found", async () => {
      organizationService.getOrganizationServices.mockResolvedValue(null);

      await organizationController.getServices(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Services not found" });
    });

    it("should handle unexpected errors", async () => {
      organizationService.getOrganizationServices.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.getServices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateInventory", () => {
    it("should update organization inventory successfully", async () => {
      const mockInventory = {
        items: ["Item 1", "Item 2"],
      };
      organizationService.updateInventory.mockResolvedValue(mockInventory);

      await organizationController.updateInventory(req, res);

      expect(organizationService.updateInventory).toHaveBeenCalledWith(
        "123",
        mockInventory
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Inventory updated successfully",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to update organization inventory for user: 123"
      );
    });

    it("should handle inventory update errors", async () => {
      organizationService.updateInventory.mockResolvedValue({
        error: "Failed to update inventory",
      });

      await organizationController.updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update inventory",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.updateInventory.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getInventory", () => {
    it("should retrieve organization inventory successfully", async () => {
      const mockInventory = {
        items: ["Item 1", "Item 2"],
      };
      organizationService.getOrganizationInventory.mockResolvedValue(
        mockInventory
      );

      await organizationController.getInventory(req, res);

      expect(organizationService.getOrganizationInventory).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to retrieve organization inventory for user: 123"
      );
    });

    it("should handle inventory not found", async () => {
      organizationService.getOrganizationInventory.mockResolvedValue(null);

      await organizationController.getInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Inventory not found" });
    });

    it("should handle unexpected errors", async () => {
      organizationService.getOrganizationInventory.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.getInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("createServiceRequest", () => {
    it("should create service request successfully", async () => {
      const mockRequest = {
        serviceId: "123",
        serviceName: "Test Service",
        serviceType: "Test Type",
      };
      organizationService.createServiceRequest.mockResolvedValue(mockRequest);

      await organizationController.createServiceRequest(req, res);

      expect(organizationService.createServiceRequest).toHaveBeenCalledWith(
        "123",
        mockRequest
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service request created successfully",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to create service request for user: 123"
      );
    });

    it("should handle service request creation errors", async () => {
      organizationService.createServiceRequest.mockResolvedValue({
        error: "Failed to create service request",
      });

      await organizationController.createServiceRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create service request",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.createServiceRequest.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.createServiceRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServiceRequests", () => {
    it("should retrieve service requests successfully", async () => {
      const mockRequests = [
        {
          serviceId: "123",
          serviceName: "Test Service",
          serviceType: "Test Type",
        },
      ];
      organizationService.getServiceRequests.mockResolvedValue(mockRequests);

      await organizationController.getServiceRequests(req, res);

      expect(organizationService.getServiceRequests).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRequests);
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to retrieve service requests for user: 123"
      );
    });

    it("should handle service requests not found", async () => {
      organizationService.getServiceRequests.mockResolvedValue([]);

      await organizationController.getServiceRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service requests not found",
      });
    });

    it("should handle unexpected errors", async () => {
      organizationService.getServiceRequests.mockRejectedValue(
        new Error("Unexpected error")
      );

      await organizationController.getServiceRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});
