const userController = require("../../controllers/userController");
const userService = require("../../services/userService");

jest.mock("../../services/userService");
jest.mock("../../utils/logger");

describe("User Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "123" },
      body: {
        name: "Updated Name",
        address: "123 Main St",
        address2: "Apt 4",
        city: "Anytown",
        state: "ST",
        zip: "12345",
        phone: "123-456-7890",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should fetch user profile successfully", async () => {
      const mockProfile = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      };
      userService.getUserProfile.mockResolvedValue(mockProfile);

      await userController.getProfile(req, res);

      expect(userService.getUserProfile).toHaveBeenCalledWith("123");
      expect(logger.info).toHaveBeenCalledWith(
        "Fetching profile for user ID: 123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });

    it("should handle user not found error", async () => {
      userService.getUserProfile.mockRejectedValue(new Error("User not found"));

      await userController.getProfile(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching user profile:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle internal server error", async () => {
      userService.getUserProfile.mockRejectedValue(new Error("Database error"));

      await userController.getProfile(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching user profile:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const mockUpdatedProfile = {
        _id: "123",
        name: "Updated Name",
        address: "123 Main St",
        address2: "Apt 4",
        city: "Anytown",
        state: "ST",
        zip: "12345",
        phone: "123-456-7890",
        updated_at: expect.any(String),
      };
      userService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

      await userController.updateProfile(req, res);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          name: "Updated Name",
          address: "123 Main St",
          address2: "Apt 4",
          city: "Anytown",
          state: "ST",
          zip: "12345",
          phone: "123-456-7890",
          updated_at: expect.any(String),
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Updating profile for user ID: 123"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updatedProfile: mockUpdatedProfile,
      });
    });

    it("should handle user not found or update failed error", async () => {
      userService.updateUserProfile.mockRejectedValue(
        new Error("User not found or update failed")
      );

      await userController.updateProfile(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating user profile:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found or update failed",
      });
    });

    it("should handle internal server error", async () => {
      userService.updateUserProfile.mockRejectedValue(
        new Error("Database error")
      );

      await userController.updateProfile(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        "Error updating user profile:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    it("should only update allowed fields", async () => {
      req.body.email = "newemail@example.com"; // This should not be updated
      const mockUpdatedProfile = {
        _id: "123",
        name: "Updated Name",
        address: "123 Main St",
        address2: "Apt 4",
        city: "Anytown",
        state: "ST",
        zip: "12345",
        phone: "123-456-7890",
        updated_at: expect.any(String),
      };
      userService.updateUserProfile.mockResolvedValue(mockUpdatedProfile);

      await userController.updateProfile(req, res);

      expect(userService.updateUserProfile).toHaveBeenCalledWith(
        "123",
        expect.not.objectContaining({
          email: "newemail@example.com",
        })
      );
    });
  });
});
