const { connectToDatabase } = require("../../config/mongoDbClient");
const userService = require("../../services/userService");

jest.mock("../../config/mongoDbClient");

describe("User Service", () => {
  let mockCollection;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    connectToDatabase.mockResolvedValue({
      collection: jest.fn().mockReturnValue(mockCollection),
    });
  });

  it("should fetch user profile successfully", async () => {
    const userId = "123";
    const mockUserProfile = {
      _id: userId,
      name: null,
      email: "test@example.com",
      accountType: null,
      created_at: new Date("2024-10-18T21:56:54.305Z"),
      updated_at: new Date("2024-10-18T21:56:54.305Z"),
    };

    mockCollection.findOne.mockResolvedValue(mockUserProfile);

    const result = await userService.getUserProfile(userId);

    expect(result).toEqual(mockUserProfile);
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: userId });
  });

  it("should return null if user profile is not found", async () => {
    const userId = "invalid-id";
    mockCollection.findOne.mockResolvedValue(null);

    const result = await userService.getUserProfile(userId);

    expect(result).toBeNull();
  });

  it("should update user profile successfully", async () => {
    const userId = "123";
    const updateData = {
      name: "Updated Name",
      address: "123 Main St",
    };
    const mockUpdatedProfile = { ...updateData, _id: userId };

    mockCollection.findOneAndUpdate.mockResolvedValue({
      value: mockUpdatedProfile,
    });

    const result = await userService.updateUserProfile(userId, updateData);

    expect(result).toEqual(mockUpdatedProfile);
    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: userId },
      { $set: updateData },
      { returnDocument: "after" }
    );
  });

  it("should throw an error if users collection is not found", async () => {
    connectToDatabase.mockResolvedValue({
      collection: jest.fn().mockReturnValue(null),
    });

    await expect(userService.updateUserProfile("123", {})).rejects.toThrow(
      "Users not found"
    );
  });
});
