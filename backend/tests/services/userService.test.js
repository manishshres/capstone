// backend/tests/middlewares/protectedService.test.js
const protectedService = require("../../services/userService");

describe("Protected Service", () => {
  it("should fetch user profile successfully", async () => {
    const userId = "123";
    const expectedProfile = {
      id: userId,
      name: "Test User",
      email: "testuser@gmail.com",
      role: "user",
    };

    const result = await protectedService.getUserProfile(userId);

    expect(result).toEqual({ userProfile: expectedProfile });
  });

  it("should throw an error if profile fetching fails", async () => {
    const userId = "invalid-id";

    await expect(protectedService.getUserProfile(userId)).rejects.toThrow(
      "Error fetching user profile"
    );
  });
});
