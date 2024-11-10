const organizationService = require("../../services/organizationService");
const { logger } = require("../../utils/logger");
const organizationController = require("../../controllers/organizationController");

jest.mock("../../services/organizationService", () => ({
  getOrganizationById: jest.fn(),
  createOrUpdateProfile: jest.fn(),
  getOrganizationProfile: jest.fn(),
  updateServices: jest.fn(),
  getOrganizationServices: jest.fn(),
  updateInventory: jest.fn(),
  getOrganizationInventory: jest.fn(),
  createServiceRequest: jest.fn(),
  getServiceRequests: jest.fn(),
  respondToServiceRequest: jest.fn(),
  getServiceRequestStats: jest.fn(),
}));
jest.mock("../../utils/logger");

describe("Organization Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { userId: "123", accountType: "org" },
      params: { id: "123" },
      body: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Default mock implementations
    organizationService.getOrganizationById.mockResolvedValue(null);
    organizationService.createOrUpdateProfile.mockResolvedValue({});
    organizationService.getOrganizationProfile.mockResolvedValue(null);
    organizationService.updateServices.mockResolvedValue({});
    organizationService.getOrganizationServices.mockResolvedValue(null);
    organizationService.updateInventory.mockResolvedValue({});
    organizationService.getOrganizationInventory.mockResolvedValue(null);
    organizationService.createServiceRequest.mockResolvedValue({});
    organizationService.getServiceRequests.mockResolvedValue([]);
    organizationService.respondToServiceRequest.mockResolvedValue(true);
    organizationService.getServiceRequestStats.mockResolvedValue({});

    // Logger mock implementations
    logger.error = jest.fn();
    logger.info = jest.fn();
    logger.warn = jest.fn();
    logger.debug = jest.fn();
  });

  describe("checkOrgAccountType", () => {
    it("should allow organization account type", () => {
      const next = jest.fn();
      organizationController.checkOrgAccountType(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should reject non-organization account type", () => {
      req.user.accountType = "user";
      const next = jest.fn();
      organizationController.checkOrgAccountType(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only organization accounts can access this resource",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizationById", () => {
    it("should retrieve organization successfully", async () => {
      const mockOrg = { id: "123", name: "Test Org" };
      organizationService.getOrganizationById.mockResolvedValueOnce(mockOrg);
      await organizationController.getOrganizationById(req, res);
      expect(organizationService.getOrganizationById).toHaveBeenCalledWith(
        "123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrg);
    });

    it("should handle missing ID", async () => {
      req.params.id = null;
      await organizationController.getOrganizationById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization ID is required",
      });
    });

    it("should handle not found", async () => {
      organizationService.getOrganizationById.mockResolvedValueOnce(null);
      await organizationController.getOrganizationById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization not found",
      });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationById.mockRejectedValueOnce(
        new Error("Test error")
      );
      await organizationController.getOrganizationById(req, res);
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("createOrUpdateProfile", () => {
    beforeEach(() => {
      req.body = {
        name: "Test Org",
        description: "Test Description",
      };
    });

    it("should create/update profile successfully", async () => {
      const mockResult = { id: "123", ...req.body };
      organizationService.createOrUpdateProfile.mockResolvedValueOnce(
        mockResult
      );
      await organizationController.createOrUpdateProfile(req, res);
      expect(organizationService.createOrUpdateProfile).toHaveBeenCalledWith(
        req.user.userId,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Organization profile created/updated successfully",
        profile: mockResult,
      });
    });

    it("should handle validation errors", async () => {
      organizationService.createOrUpdateProfile.mockResolvedValueOnce({
        error: "Invalid data",
      });
      await organizationController.createOrUpdateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid data" });
    });

    it("should handle errors", async () => {
      organizationService.createOrUpdateProfile.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.createOrUpdateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateServices", () => {
    beforeEach(() => {
      req.body = {
        description: "Test Services",
        serviceList: ["Service 1", "Service 2"],
      };
    });

    it("should update services successfully", async () => {
      organizationService.updateServices.mockResolvedValueOnce({
        success: true,
      });
      await organizationController.updateServices(req, res);
      expect(organizationService.updateServices).toHaveBeenCalledWith(
        req.user.userId,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Services updated successfully",
      });
    });

    it("should handle invalid service list", async () => {
      req.body.serviceList = "not an array";
      await organizationController.updateServices(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service list must be an array",
      });
    });

    it("should handle errors", async () => {
      organizationService.updateServices.mockRejectedValueOnce(new Error());
      await organizationController.updateServices(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServices", () => {
    it("should retrieve services successfully", async () => {
      const mockServices = { description: "Test", serviceList: ["Service 1"] };
      organizationService.getOrganizationServices.mockResolvedValueOnce(
        mockServices
      );
      await organizationController.getServices(req, res);
      expect(organizationService.getOrganizationServices).toHaveBeenCalledWith(
        req.user.userId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockServices);
    });

    it("should handle not found", async () => {
      await organizationController.getServices(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Services not found" });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationServices.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getServices(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("createServiceRequest", () => {
    beforeEach(() => {
      req.body = {
        organizationId: "org123",
        serviceId: "service123",
        serviceName: "Test Service",
        serviceType: "food",
        description: "Test request",
      };
    });

    it("should create service request successfully", async () => {
      const mockResult = { requestId: "request123", success: true };
      organizationService.createServiceRequest.mockResolvedValueOnce(
        mockResult
      );
      await organizationController.createServiceRequest(req, res);
      expect(organizationService.createServiceRequest).toHaveBeenCalledWith(
        req.user.userId,
        req.body.organizationId,
        expect.objectContaining({
          serviceId: req.body.serviceId,
          serviceName: req.body.serviceName,
          serviceType: req.body.serviceType,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service request created successfully",
        requestId: "request123",
      });
    });

    it("should handle organization not found", async () => {
      organizationService.createServiceRequest.mockRejectedValueOnce(
        new Error("Organization not found")
      );
      await organizationController.createServiceRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization not found",
      });
    });

    it("should handle service not found", async () => {
      organizationService.createServiceRequest.mockRejectedValueOnce(
        new Error("Service not found")
      );
      await organizationController.createServiceRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Service not found" });
    });

    it("should handle errors", async () => {
      organizationService.createServiceRequest.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.createServiceRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServiceRequests", () => {
    it("should retrieve requests successfully", async () => {
      const mockRequests = [{ id: "req1" }, { id: "req2" }];
      organizationService.getServiceRequests.mockResolvedValueOnce(
        mockRequests
      );
      await organizationController.getServiceRequests(req, res);
      expect(organizationService.getServiceRequests).toHaveBeenCalledWith(
        req.user.userId,
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRequests);
    });

    it("should handle no requests found", async () => {
      await organizationController.getServiceRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service requests not found",
      });
    });

    it("should handle errors", async () => {
      organizationService.getServiceRequests.mockRejectedValueOnce(new Error());
      await organizationController.getServiceRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("respondToServiceRequest", () => {
    beforeEach(() => {
      req.params.requestId = "request123";
      req.body = {
        response: "Approved",
        availabilityDate: "2024-12-01",
      };
    });

    it("should respond successfully", async () => {
      organizationService.respondToServiceRequest.mockResolvedValueOnce(true);
      await organizationController.respondToServiceRequest(req, res);
      expect(organizationService.respondToServiceRequest).toHaveBeenCalledWith(
        req.user.userId,
        req.params.requestId,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Response added successfully",
      });
    });

    it("should handle not found", async () => {
      organizationService.respondToServiceRequest.mockResolvedValueOnce(false);
      await organizationController.respondToServiceRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service request not found",
      });
    });

    it("should handle errors", async () => {
      organizationService.respondToServiceRequest.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.respondToServiceRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateInventory", () => {
    beforeEach(() => {
      req.body = {
        items: [
          { name: "Item 1", quantity: 10 },
          { name: "Item 2", quantity: 20 },
        ],
      };
    });

    it("should update inventory successfully", async () => {
      organizationService.updateInventory.mockResolvedValueOnce({
        success: true,
      });
      await organizationController.updateInventory(req, res);
      expect(organizationService.updateInventory).toHaveBeenCalledWith(
        req.user.userId,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Inventory updated successfully",
      });
    });

    it("should handle validation errors", async () => {
      organizationService.updateInventory.mockResolvedValueOnce({
        error: "Invalid inventory data",
      });
      await organizationController.updateInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid inventory data",
      });
    });

    it("should handle errors", async () => {
      organizationService.updateInventory.mockRejectedValueOnce(new Error());
      await organizationController.updateInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getInventory", () => {
    it("should retrieve inventory successfully", async () => {
      const mockInventory = {
        items: [
          { name: "Item 1", quantity: 10 },
          { name: "Item 2", quantity: 20 },
        ],
      };
      organizationService.getOrganizationInventory.mockResolvedValueOnce(
        mockInventory
      );
      await organizationController.getInventory(req, res);
      expect(organizationService.getOrganizationInventory).toHaveBeenCalledWith(
        req.user.userId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
    });

    it("should handle not found", async () => {
      organizationService.getOrganizationInventory.mockResolvedValueOnce(null);
      await organizationController.getInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Inventory not found" });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationInventory.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServiceRequestStats", () => {
    beforeEach(() => {
      req.query = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };
    });

    it("should retrieve stats successfully", async () => {
      const mockStats = {
        total: 100,
        pending: 30,
        approved: 70,
      };
      organizationService.getServiceRequestStats.mockResolvedValueOnce(
        mockStats
      );
      await organizationController.getServiceRequestStats(req, res);
      expect(organizationService.getServiceRequestStats).toHaveBeenCalledWith(
        req.user.userId,
        req.query.startDate,
        req.query.endDate
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it("should handle date range filters", async () => {
      const mockStats = { total: 50, pending: 20, approved: 30 };
      organizationService.getServiceRequestStats.mockResolvedValueOnce(
        mockStats
      );
      req.query = {
        startDate: "2024-06-01",
        endDate: "2024-06-30",
      };
      await organizationController.getServiceRequestStats(req, res);
      expect(organizationService.getServiceRequestStats).toHaveBeenCalledWith(
        req.user.userId,
        "2024-06-01",
        "2024-06-30"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it("should handle missing date parameters", async () => {
      const mockStats = { total: 150, pending: 50, approved: 100 };
      organizationService.getServiceRequestStats.mockResolvedValueOnce(
        mockStats
      );
      req.query = {};
      await organizationController.getServiceRequestStats(req, res);
      expect(organizationService.getServiceRequestStats).toHaveBeenCalledWith(
        req.user.userId,
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it("should handle errors", async () => {
      organizationService.getServiceRequestStats.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getServiceRequestStats(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getServiceRequests with filters", () => {
    it("should handle filtering by status", async () => {
      const mockRequests = [{ id: "req1", status: "pending" }];
      req.query.status = "pending";
      organizationService.getServiceRequests.mockResolvedValueOnce(
        mockRequests
      );
      await organizationController.getServiceRequests(req, res);
      expect(organizationService.getServiceRequests).toHaveBeenCalledWith(
        req.user.userId,
        "pending",
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRequests);
    });

    it("should handle filtering by type", async () => {
      const mockRequests = [{ id: "req1", type: "food" }];
      req.query.type = "food";
      organizationService.getServiceRequests.mockResolvedValueOnce(
        mockRequests
      );
      await organizationController.getServiceRequests(req, res);
      expect(organizationService.getServiceRequests).toHaveBeenCalledWith(
        req.user.userId,
        undefined,
        "food"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRequests);
    });

    it("should handle combined filters", async () => {
      const mockRequests = [{ id: "req1", status: "pending", type: "food" }];
      req.query = { status: "pending", type: "food" };
      organizationService.getServiceRequests.mockResolvedValueOnce(
        mockRequests
      );
      await organizationController.getServiceRequests(req, res);
      expect(organizationService.getServiceRequests).toHaveBeenCalledWith(
        req.user.userId,
        "pending",
        "food"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRequests);
    });
  });

  describe("getProfile with additional cases", () => {
    it("should handle malformed profile data", async () => {
      const malformedProfile = { _id: "123" }; // Missing required fields
      organizationService.getOrganizationProfile.mockResolvedValueOnce(
        malformedProfile
      );
      await organizationController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(malformedProfile);
    });

    it("should handle database connection errors", async () => {
      organizationService.getOrganizationProfile.mockRejectedValueOnce(
        new Error("Database connection failed")
      );
      await organizationController.getProfile(req, res);
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});
