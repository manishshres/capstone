const organizationController = require("../../controllers/organizationController");
const organizationService = require("../../services/organizationService");
const { logger } = require("../../utils/logger");

// Mock the organizationService and logger
jest.mock("../../services/organizationService");
jest.mock("../../utils/logger");

describe("Organization Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { userId: "testUserId", accountType: "org" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createOrUpdateProfile", () => {
    it("should create or update profile successfully", async () => {
      const profileData = { name: "Test Org", address: "123 Test St" };
      req.body = profileData;
      organizationService.createOrUpdateProfile.mockResolvedValue({
        success: true,
      });

      await organizationController.createOrUpdateProfile(req, res);

      expect(organizationService.createOrUpdateProfile).toHaveBeenCalledWith(
        "testUserId",
        profileData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Organization profile created/updated successfully",
        })
      );
    });

    it("should handle errors when creating or updating profile", async () => {
      organizationService.createOrUpdateProfile.mockRejectedValue(
        new Error("Test error")
      );

      await organizationController.createOrUpdateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updateServices", () => {
    it("should update services successfully", async () => {
      const servicesData = [
        { name: "Food Service", availability: "Available" },
      ];
      req.body = servicesData;
      organizationService.updateServices.mockResolvedValue({ success: true });

      await organizationController.updateServices(req, res);

      expect(organizationService.updateServices).toHaveBeenCalledWith(
        "testUserId",
        servicesData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Services updated successfully",
      });
    });

    it("should handle errors when updating services", async () => {
      organizationService.updateServices.mockRejectedValue(
        new Error("Test error")
      );

      await organizationController.updateServices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getServices", () => {
    it("should retrieve services successfully", async () => {
      const mockServices = [
        { name: "Food Service", availability: "Available" },
      ];
      organizationService.getOrganizationServices.mockResolvedValue(
        mockServices
      );

      await organizationController.getServices(req, res);

      expect(organizationService.getOrganizationServices).toHaveBeenCalledWith(
        "testUserId"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockServices);
    });

    it("should handle errors when retrieving services", async () => {
      organizationService.getOrganizationServices.mockRejectedValue(
        new Error("Test error")
      );

      await organizationController.getServices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updateInventory", () => {
    it("should update inventory successfully", async () => {
      const inventoryData = [{ item: "Canned Food", quantity: 100 }];
      req.body = inventoryData;
      organizationService.updateInventory.mockResolvedValue({ success: true });

      await organizationController.updateInventory(req, res);

      expect(organizationService.updateInventory).toHaveBeenCalledWith(
        "testUserId",
        inventoryData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Inventory updated successfully",
      });
    });

    it("should handle errors when updating inventory", async () => {
      organizationService.updateInventory.mockRejectedValue(
        new Error("Test error")
      );

      await organizationController.updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getInventory", () => {
    it("should retrieve inventory successfully", async () => {
      const mockInventory = [{ item: "Canned Food", quantity: 100 }];
      organizationService.getOrganizationInventory.mockResolvedValue(
        mockInventory
      );

      await organizationController.getInventory(req, res);

      expect(organizationService.getOrganizationInventory).toHaveBeenCalledWith(
        "testUserId"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
    });

    it("should handle errors when retrieving inventory", async () => {
      organizationService.getOrganizationInventory.mockRejectedValue(
        new Error("Test error")
      );

      await organizationController.getInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("checkOrgAccountType", () => {
    it("should allow access for org account type", () => {
      const next = jest.fn();
      organizationController.checkOrgAccountType(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should deny access for non-org account type", () => {
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

  describe("getProfile", () => {
    it("should retrieve profile successfully", async () => {
      const mockProfile = { name: "Test Org", address: "123 Test St" };
      organizationService.getOrganizationProfile.mockResolvedValue(mockProfile);

      await organizationController.getProfile(req, res);

      expect(organizationService.getOrganizationProfile).toHaveBeenCalledWith(
        "testUserId"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it("should return 404 when profile is not found", async () => {
      const error = new Error("Organization profile not found");
      organizationService.getOrganizationProfile.mockRejectedValue(error);

      await organizationController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Organization profile not found",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching organization profile:",
        error
      );
    });

    it("should return 500 for other errors", async () => {
      const error = new Error("Database connection error");
      organizationService.getOrganizationProfile.mockRejectedValue(error);

      await organizationController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching organization profile:",
        error
      );
    });
  });
});
