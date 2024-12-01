const organizationService = require("../../services/organizationService");
const { logger } = require("../../utils/logger");
const organizationController = require("../../controllers/organizationController");

jest.mock("../../services/organizationService");
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
    organizationService.getOrganizationProfile.mockResolvedValue(null);
    organizationService.updateOrganizationProfile.mockResolvedValue({});
    organizationService.updateOrganizationServices.mockResolvedValue({});
    organizationService.getOrganizationServices.mockResolvedValue(null);
    organizationService.updateOrganizationInventory.mockResolvedValue({});
    organizationService.getOrganizationInventory.mockResolvedValue(null);

    logger.error = jest.fn();
    logger.info = jest.fn();
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

  describe("updateOrganizationProfile", () => {
    beforeEach(() => {
      req.body = {
        name: "Test Org",
        description: "Test Description",
      };
    });

    it("should update profile successfully", async () => {
      organizationService.updateOrganizationProfile.mockResolvedValueOnce({});
      await organizationController.updateOrganizationProfile(req, res);
      expect(
        organizationService.updateOrganizationProfile
      ).toHaveBeenCalledWith(req.user.userId, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Organization profile updated successfully",
      });
    });

    it("should handle validation errors", async () => {
      organizationService.updateOrganizationProfile.mockResolvedValueOnce({
        error: "Invalid data",
      });
      await organizationController.updateOrganizationProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid data" });
    });

    it("should handle errors", async () => {
      organizationService.updateOrganizationProfile.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.updateOrganizationProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getOrganizationProfile", () => {
    it("should retrieve profile successfully", async () => {
      const mockProfile = { id: "123", name: "Test Org" };
      organizationService.getOrganizationProfile.mockResolvedValueOnce(
        mockProfile
      );
      await organizationController.getOrganizationProfile(req, res);
      expect(organizationService.getOrganizationProfile).toHaveBeenCalledWith(
        req.user.userId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it("should handle not found", async () => {
      await organizationController.getOrganizationProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Profile not found" });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationProfile.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getOrganizationProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateOrganizationServices", () => {
    beforeEach(() => {
      req.body = {
        description: "Test Services",
        serviceList: ["Service 1", "Service 2"],
      };
    });

    it("should update services successfully", async () => {
      organizationService.updateOrganizationServices.mockResolvedValueOnce({});
      await organizationController.updateOrganizationServices(req, res);
      expect(
        organizationService.updateOrganizationServices
      ).toHaveBeenCalledWith(req.user.userId, {
        description: req.body.description,
        serviceList: req.body.serviceList,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Services updated successfully",
      });
    });

    it("should handle invalid service list", async () => {
      req.body.serviceList = "not an array";
      await organizationController.updateOrganizationServices(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Service list must be an array",
      });
    });

    it("should handle validation errors", async () => {
      organizationService.updateOrganizationServices.mockResolvedValueOnce({
        error: "Invalid services",
      });
      await organizationController.updateOrganizationServices(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid services" });
    });

    it("should handle errors", async () => {
      organizationService.updateOrganizationServices.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.updateOrganizationServices(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getOrganizationServices", () => {
    it("should retrieve services successfully", async () => {
      const mockServices = {
        description: "Test Services",
        serviceList: ["Service 1", "Service 2"],
      };
      organizationService.getOrganizationServices.mockResolvedValueOnce(
        mockServices
      );
      await organizationController.getOrganizationServices(req, res);
      expect(organizationService.getOrganizationServices).toHaveBeenCalledWith(
        req.user.userId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockServices);
    });

    it("should handle not found", async () => {
      await organizationController.getOrganizationServices(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Services not found" });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationServices.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getOrganizationServices(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("updateOrganizationInventory", () => {
    beforeEach(() => {
      req.body = {
        items: [
          { name: "Item 1", quantity: 10 },
          { name: "Item 2", quantity: 20 },
        ],
      };
    });

    it("should update inventory successfully", async () => {
      organizationService.updateOrganizationInventory.mockResolvedValueOnce({});
      await organizationController.updateOrganizationInventory(req, res);
      expect(
        organizationService.updateOrganizationInventory
      ).toHaveBeenCalledWith(req.user.userId, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Inventory updated successfully",
      });
    });

    it("should handle validation errors", async () => {
      organizationService.updateOrganizationInventory.mockResolvedValueOnce({
        error: "Invalid inventory data",
      });
      await organizationController.updateOrganizationInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid inventory data",
      });
    });

    it("should handle errors", async () => {
      organizationService.updateOrganizationInventory.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.updateOrganizationInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getOrganizationInventory", () => {
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
      await organizationController.getOrganizationInventory(req, res);
      expect(organizationService.getOrganizationInventory).toHaveBeenCalledWith(
        req.user.userId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
    });

    it("should handle not found", async () => {
      await organizationController.getOrganizationInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Inventory not found" });
    });

    it("should handle errors", async () => {
      organizationService.getOrganizationInventory.mockRejectedValueOnce(
        new Error()
      );
      await organizationController.getOrganizationInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});
