const organizationService = require("../services/organizationService");
const { logger } = require("../utils/logger");

const checkOrgAccountType = (req, res, next) => {
  if (req.user.accountType !== "org") {
    console.log(req.user);
    return res
      .status(403)
      .json({ error: "Only organization accounts can access this resource" });
  }
  next();
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    const result = await organizationService.createOrUpdateProfile(
      userId,
      profileData
    );

    logger.info(`Organization profile created/updated for user: ${userId}`);
    res.status(200).json({
      message: "Organization profile created/updated successfully",
      result,
    });
  } catch (error) {
    logger.error("Error creating/updating organization profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await organizationService.getOrganizationProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    logger.error("Error fetching organization profile:", error);
    if (error.message === "Organization profile not found") {
      res.status(404).json({ error: "Organization profile not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.checkOrgAccountType = checkOrgAccountType;
