const authService = require("../services/authService");
const { logger } = require("../utils/logger");
const jwt = require("jsonwebtoken");

// Controller function for user registration
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log the registration attempt
    logger.info(`Attempting to register user with email: ${email}`);

    const result = await authService.register(email, password);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "User registered successfully", token: token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller function for user login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log the login attempt
    logger.info(`Attempting to log in user with email: ${email}`);

    const result = await authService.login(email, password);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
