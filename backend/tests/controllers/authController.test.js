const authController = require("../../controllers/authController");
const authService = require("../../services/authService");
const jwt = require("jsonwebtoken");
const { logger } = require("../../utils/logger");

jest.mock("../../services/authService");
jest.mock("jsonwebtoken");
jest.mock("../../utils/logger");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        accountType: "user",
      },
      user: { userId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        accountType: "user",
      };
      authService.register.mockResolvedValue({ user: mockUser });
      jwt.sign.mockReturnValue("fake-token");

      await authController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "Test User",
        "user"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          accountType: mockUser.accountType,
        },
        process.env.SUPABASE_JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "user registered successfully",
        token: "fake-token",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to register user with email: test@example.com"
      );
    });

    it("should handle invalid account type", async () => {
      req.body.accountType = "invalid";

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid account type. Must be 'user' or 'org'.",
      });
    });

    it("should handle registration errors", async () => {
      authService.register.mockResolvedValue({ error: "Registration failed" });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Registration failed" });
    });

    it("should handle unexpected errors", async () => {
      authService.register.mockRejectedValue(new Error("Unexpected error"));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("login", () => {
    it("should log in a user successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        accountType: "user",
      };
      authService.login.mockResolvedValue({ user: mockUser });
      jwt.sign.mockReturnValue("fake-token");

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          accountType: mockUser.accountType,
        },
        process.env.SUPABASE_JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        token: "fake-token",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Attempting to log in user with email: test@example.com"
      );
      expect(logger.info).toHaveBeenCalledWith(
        "User logged in successfully: test@example.com"
      );
    });

    it("should handle login errors", async () => {
      authService.login.mockResolvedValue({ error: "Invalid credentials" });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it("should handle unexpected errors", async () => {
      authService.login.mockRejectedValue(new Error("Unexpected error"));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("authStatus", () => {
    it("should return logged in status", async () => {
      await authController.authStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged in!" });
    });

    it("should handle unexpected errors", async () => {
      const error = new Error("Unexpected error");
      res.status.mockImplementationOnce(() => {
        throw error;
      });

      await authController.authStatus(req, res);

      expect(logger.error).toHaveBeenCalledWith("Login error:", error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});
