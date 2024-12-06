const authService = require("../services/authService");
const { logger } = require("../utils/logger");
const jwt = require("jsonwebtoken");

// Controller function for user registration
exports.register = async (req, res) => {
  try {
    const { email, password, name, accountType } = req.body;

    // Validate accountType
    if (accountType !== "user" && accountType !== "org") {
      return res
        .status(400)
        .json({ error: "Invalid account type. Must be 'user' or 'org'." });
    }

    // Log the registration attempt
    logger.info(`Attempting to register ${accountType} with email: ${email}`);

    const result = await authService.register(
      email,
      password,
      name,
      accountType
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        accountType: result.user.accountType,
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `${accountType} registered successfully`,
      token: token,
    });
  } catch (error) {
    //console.error("Registration error:", error);
    logger.error("Registration error:", error);
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

    const { user } = result;
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        accountType: user.accountType, // Include accountType in the token
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountType: user.accountType,
      },
      token: token,
    });
  } catch (error) {
    //console.error("Login error:", error);
    logger.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// check auth status
exports.authStatus = async (req, res) => {
  try {
    res.status(200).json({
      message: `Logged in!`,
    });
  } catch (error) {
    //console.error("Login error:", error);
    logger.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`Password reset requested for email: ${email}`);

    const result = await authService.resetPassword(email);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    logger.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to process password reset" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new password are required" });
    }

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Password change error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

exports.updatePasswordWithToken = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    const result = await authService.updatePasswordWithToken(newPassword);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("Password reset completion error:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};
