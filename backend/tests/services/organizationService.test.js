const { connectToDatabase } = require("../../config/mongoDbClient");
const organizationService = require("../../services/organizationService");

jest.mock("../../config/mongoDbClient");

describe("Organization Service", () => {
  let mockDb, mockCollection, mockUpdateOne, mockFindOne;

  beforeEach(() => {
    mockUpdateOne = jest.fn();
    mockFindOne = jest.fn();
    mockCollection = jest.fn(() => ({
      updateOne: mockUpdateOne,
      findOne: mockFindOne,
    }));
    mockDb = {
      collection: mockCollection,
    };
    connectToDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrUpdateProfile", () => {
    it("should create or update organization profile", async () => {
      const userId = "testUserId";
      const profileData = { name: "Test Org" };

      mockUpdateOne.mockResolvedValue({ upsertedId: "newId" });

      const result = await organizationService.createOrUpdateProfile(
        userId,
        profileData
      );

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { userId: userId },
        {
          $set: {
            profile: profileData,
            updatedAt: expect.any(Date),
          },
          $setOnInsert: { createdAt: expect.any(Date) },
        },
        { upsert: true }
      );
      expect(result).toEqual({ success: true, upsertedId: "newId" });
    });

    it("should handle errors when creating or updating profile", async () => {
      const userId = "testUserId";
      const profileData = { name: "Test Org" };

      mockUpdateOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.createOrUpdateProfile(userId, profileData)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrganizationServices", () => {
    it("should return organization services", async () => {
      const userId = "testUserId";
      const mockServices = { service1: true, service2: false };

      mockFindOne.mockResolvedValue({ services: mockServices });

      const result = await organizationService.getOrganizationServices(userId);

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockFindOne).toHaveBeenCalledWith({ userId: userId });
      expect(result).toEqual(mockServices);
    });

    it("should throw an error if organization is not found", async () => {
      const userId = "testUserId";

      mockFindOne.mockResolvedValue(null);

      await expect(
        organizationService.getOrganizationServices(userId)
      ).rejects.toThrow("Organization not found");
    });
  });

  describe("updateServices", () => {
    it("should update organization services", async () => {
      const userId = "testUserId";
      const servicesData = { service1: true, service2: false };

      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateServices(
        userId,
        servicesData
      );

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { userId: userId },
        {
          $set: {
            services: servicesData,
            updatedAt: expect.any(Date),
          },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle errors when updating services", async () => {
      const userId = "testUserId";
      const servicesData = { service1: true, service2: false };

      mockUpdateOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.updateServices(userId, servicesData)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrganizationProfile", () => {
    it("should return organization profile", async () => {
      const userId = "testUserId";
      const mockProfile = { name: "Test Org", address: "123 Test St" };

      mockFindOne.mockResolvedValue({ profile: mockProfile });

      const result = await organizationService.getOrganizationProfile(userId);

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockFindOne).toHaveBeenCalledWith({ userId: userId });
      expect(result).toEqual(mockProfile);
    });

    it("should throw an error if organization profile is not found", async () => {
      const userId = "testUserId";

      mockFindOne.mockResolvedValue(null);

      await expect(
        organizationService.getOrganizationProfile(userId)
      ).rejects.toThrow("Organization profile not found");
    });
  });

  describe("getOrganizationInventory", () => {
    it("should return organization inventory", async () => {
      const userId = "testUserId";
      const mockInventory = { item1: 10, item2: 20 };

      mockFindOne.mockResolvedValue({ inventory: mockInventory });

      const result = await organizationService.getOrganizationInventory(userId);

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockFindOne).toHaveBeenCalledWith({ userId: userId });
      expect(result).toEqual(mockInventory);
    });

    it("should throw an error if organization is not found", async () => {
      const userId = "testUserId";

      mockFindOne.mockResolvedValue(null);

      await expect(
        organizationService.getOrganizationInventory(userId)
      ).rejects.toThrow("Organization not found");
    });
  });

  describe("updateInventory", () => {
    it("should update organization inventory", async () => {
      const userId = "testUserId";
      const inventoryData = { item1: 15, item2: 25 };

      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateInventory(
        userId,
        inventoryData
      );

      expect(mockCollection).toHaveBeenCalledWith("organizations");
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { userId: userId },
        {
          $set: {
            inventory: inventoryData,
            updatedAt: expect.any(Date),
          },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle errors when updating inventory", async () => {
      const userId = "testUserId";
      const inventoryData = { item1: 15, item2: 25 };

      mockUpdateOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.updateInventory(userId, inventoryData)
      ).rejects.toThrow("Database error");
    });
  });
});
