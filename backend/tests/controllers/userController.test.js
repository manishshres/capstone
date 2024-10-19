const protectedController = require("../../controllers/userController");
const protectedService = require("../../services/userService");

jest.mock("../../services/userService");
jest.mock("../../utils/logger");

describe("Protected Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should fetch user profile successfully", async () => {
    const mockProfile = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    };
    protectedService.getUserProfile.mockResolvedValue({
      userProfile: mockProfile,
    });

    await protectedController.getProtectedProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User profile fetched successfully",
      profile: mockProfile,
    });
  });

  it("should handle errors when fetching user profile", async () => {
    protectedService.getUserProfile.mockRejectedValue(
      new Error("Database error")
    );

    await protectedController.getProtectedProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
