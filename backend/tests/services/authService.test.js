const authService = require("../../services/authService");
const supabase = require("../../config/supabaseClient");
const { connectToDatabase } = require("../../config/mongoDbClient");

jest.mock("../../config/supabaseClient");
jest.mock("../../config/mongoDbClient");

describe("Auth Service", () => {
  const mockName = "Test User";
  const mockAccountType = "user";
  const mockEmail = "test@example.com";
  const mockPassword = "password123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      const mockUser = {
        id: "123",
        email: mockEmail,
      };
      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: "123" }),
        }),
      };
      connectToDatabase.mockResolvedValue(mockDb);

      const result = await authService.register(
        mockEmail,
        mockPassword,
        mockName,
        mockAccountType
      );

      expect(result).toEqual({
        user: {
          id: "123",
          email: mockEmail,
          name: mockName,
          accountType: mockAccountType,
        },
      });
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockPassword,
        options: {
          data: {
            name: mockName,
            accountType: mockAccountType,
          },
        },
      });
      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockDb.collection().insertOne).toHaveBeenCalled();
    });

    it("should handle registration errors", async () => {
      const mockError = new Error("Registration failed");
      supabase.auth.signUp.mockResolvedValue({ data: null, error: mockError });

      const result = await authService.register(
        mockEmail,
        mockPassword,
        mockName,
        mockAccountType
      );

      expect(result).toEqual({ error: "Registration failed" });
    });
  });

  describe("login", () => {
    it("should log in a user successfully", async () => {
      const mockUser = { id: "123", email: mockEmail };
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDbUser = {
        _id: "123",
        email: mockEmail,
        name: mockName,
        accountType: mockAccountType,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockDbUser),
        }),
      };
      connectToDatabase.mockResolvedValue(mockDb);

      const result = await authService.login(mockEmail, mockPassword);

      expect(result).toEqual({
        user: {
          id: "123",
          email: mockEmail,
          name: mockName,
          accountType: mockAccountType,
        },
      });
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockPassword,
      });
      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockDb.collection().findOne).toHaveBeenCalledWith({ _id: "123" });
    });

    it("should handle login errors", async () => {
      const mockError = new Error("Invalid credentials");
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await authService.login(mockEmail, mockPassword);

      expect(result).toEqual({ error: "Invalid credentials" });
    });

    it("should handle user not found in MongoDB", async () => {
      const mockUser = { id: "123", email: mockEmail };
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      };
      connectToDatabase.mockResolvedValue(mockDb);

      const result = await authService.login(mockEmail, mockPassword);

      expect(result).toEqual({ error: "User data not found in MongoDB" });
    });
  });
});
