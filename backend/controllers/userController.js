const userService = require("../services/userService");
const { logger } = require("../utils/logger");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info(`Fetching profile for user ID: ${userId}`);

    const userProfile = await userService.getUserProfile(userId);
    console.log(userProfile);

    res.status(200).json(userProfile);
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, address, address2, city, state, zip, phone } = req.body;
    logger.info(`Updating profile for user ID: ${userId}`);

    // Only allow updating name and email
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (address2) updateData.address2 = address2;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zip) updateData.zip = zip;
    if (phone) updateData.phone = phone;

    updateData.updated_at = new Date().toISOString();

    const updatedProfile = await userService.updateUserProfile(
      userId,
      updateData
    );

    res.status(200).json({ updatedProfile });
  } catch (error) {
    logger.error("Error updating user profile:", error);
    if (error.message === "User not found or update failed") {
      return res.status(404).json({ error: "User not found or update failed" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
