const { connectToDatabase } = require("../../config/mongoDbClient");
const organizationService = require("../../services/organizationService");

jest.mock("../../config/mongoDbClient");
jest.mock("../../utils/logger");

describe("Organization Service", () => {
  let mockDb;
  let mockOrganizations;

  beforeEach(() => {
    realDateNow = Date.now;
    global.Date.now = jest.fn(() => 1234567890);
    mockOrganizations = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockOrganizations),
    };

    connectToDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  describe("getOrganizationDocument", () => {
    const userId = "user123";

    it("should find organization by userId or org_id", async () => {
      const mockOrg = { userId, profile: { name: "Test Org" } };
      mockOrganizations.findOne.mockResolvedValue(mockOrg);

      const result = await organizationService.getOrganizationById(userId);

      expect(mockDb.collection).toHaveBeenCalledWith("organizations");
      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        $or: [{ userId }, { "profile.org_id": userId }],
      });
      expect(result).toEqual(mockOrg);
    });

    it("should handle database errors", async () => {
      mockOrganizations.findOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.getOrganizationById(userId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrganizationProfile", () => {
    const userId = "user123";

    it("should return organization profile when found", async () => {
      const mockProfile = { name: "Test Org", description: "Test Description" };
      mockOrganizations.findOne.mockResolvedValue({ profile: mockProfile });

      const result = await organizationService.getOrganizationProfile(userId);

      expect(mockOrganizations.findOne).toHaveBeenCalledWith({
        $or: [{ userId }, { "profile.org_id": userId }],
      });
      expect(result).toEqual(mockProfile);
    });

    it("should return undefined when organization not found", async () => {
      mockOrganizations.findOne.mockResolvedValue(null);

      const result = await organizationService.getOrganizationProfile(userId);

      expect(result).toBeUndefined();
    });

    it("should handle database errors", async () => {
      mockOrganizations.findOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.getOrganizationProfile(userId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateOrganizationProfile", () => {
    const userId = "user123";
    const profileData = {
      name: "Updated Org",
      description: "Updated Description",
    };

    it("should update profile successfully", async () => {
      mockOrganizations.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateOrganizationProfile(
        userId,
        profileData
      );

      expect(mockOrganizations.updateOne).toHaveBeenCalledWith(
        { userId },
        {
          $set: {
            "profile.name": "Updated Org",
            "profile.description": "Updated Description",
            updatedAt: expect.any(Date),
          },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle database errors", async () => {
      mockOrganizations.updateOne.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        organizationService.updateOrganizationProfile(userId, profileData)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrganizationServices", () => {
    const userId = "user123";

    it("should return services when found", async () => {
      const mockServices = {
        description: "Our Services",
        serviceList: [{ id: "service1", name: "Service 1" }],
      };
      mockOrganizations.findOne.mockResolvedValue({ services: mockServices });

      const result = await organizationService.getOrganizationServices(userId);

      expect(result).toEqual(mockServices);
    });

    it("should return undefined when organization not found", async () => {
      mockOrganizations.findOne.mockResolvedValue(null);

      const result = await organizationService.getOrganizationServices(userId);

      expect(result).toBeUndefined();
    });

    it("should handle database errors", async () => {
      mockOrganizations.findOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.getOrganizationServices(userId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateOrganizationServices", () => {
    const userId = "user123";
    const servicesData = {
      description: "Updated Services",
      serviceList: [
        {
          id: 123456789,
          name: "Service 1",
          type: "type1",
          description: "Service 1 desc",
          availability: "always",
        },
      ],
    };

    it("should update services successfully", async () => {
      mockOrganizations.updateOne.mockResolvedValue({ modifiedCount: 1 });
      const fixedDate = new Date("2024-01-01T00:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => fixedDate);

      mockOrganizations.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateOrganizationServices(
        userId,
        servicesData
      );

      expect(mockOrganizations.updateOne).toHaveBeenCalledWith(
        { userId },
        {
          $set: {
            "services.description": "Updated Services",
            "services.serviceList": expect.arrayContaining([
              expect.objectContaining({
                id: 123456789,
                name: "Service 1",
                type: "type1",
                description: "Service 1 desc",
                availability: "always",
              }),
            ]),
            updatedAt: fixedDate,
          },
        }
      );
      expect(result).toEqual({ success: true });

      jest.spyOn(global, "Date").mockRestore();
    });

    it("should handle database errors", async () => {
      mockOrganizations.updateOne.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        organizationService.updateOrganizationServices(userId, servicesData)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getOrganizationInventory", () => {
    const userId = "user123";

    it("should return inventory when found", async () => {
      const mockInventory = {
        description: "Our Inventory",
        inventoryList: [{ id: "item1", name: "Item 1" }],
      };
      mockOrganizations.findOne.mockResolvedValue({ inventory: mockInventory });

      const result = await organizationService.getOrganizationInventory(userId);

      expect(result).toEqual(mockInventory);
    });

    it("should return undefined when organization not found", async () => {
      mockOrganizations.findOne.mockResolvedValue(null);

      const result = await organizationService.getOrganizationInventory(userId);

      expect(result).toBeUndefined();
    });

    it("should handle database errors", async () => {
      mockOrganizations.findOne.mockRejectedValue(new Error("Database error"));

      await expect(
        organizationService.getOrganizationInventory(userId)
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateOrganizationInventory", () => {
    const userId = "user123";
    const inventoryData = {
      description: "Updated Inventory",
      inventoryList: [{ id: "item1", name: "Item 1", quantity: 10 }],
    };

    it("should update inventory successfully", async () => {
      const fixedDate = new Date("2024-01-01T00:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => fixedDate);

      mockOrganizations.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await organizationService.updateOrganizationInventory(
        userId,
        inventoryData
      );

      expect(mockOrganizations.updateOne).toHaveBeenCalledWith(
        { userId },
        {
          $set: {
            "inventory.description": "Updated Inventory",
            "inventory.inventoryList": inventoryData.inventoryList,
            updatedAt: fixedDate,
          },
        }
      );
      expect(result).toEqual({ success: true });

      jest.spyOn(global, "Date").mockRestore();
    });

    it("should handle database errors", async () => {
      mockOrganizations.updateOne.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        organizationService.updateOrganizationInventory(userId, inventoryData)
      ).rejects.toThrow("Database error");
    });
  });
});
