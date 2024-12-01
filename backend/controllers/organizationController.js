const organizationService = require("../services/organizationService");
const { logger } = require("../utils/logger");

// Middleware to check if account type is organization
exports.checkOrgAccountType = (req, res, next) => {
  if (req.user.accountType !== "org") {
    return res.status(403).json({
      error: "Only organization accounts can access this resource",
    });
  }
  next();
};

// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const orgId = req.params.id;
    if (!orgId) {
      return res.status(400).json({ error: "Organization ID is required" });
    }

    logger.info(`Fetching organization with ID: ${orgId}`);
    const organization = await organizationService.getOrganizationById(orgId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error) {
    logger.error("Error fetching organization by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update organization profile
exports.updateOrganizationProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    logger.info(`Updating organization profile for user: ${userId}`);
    const result = await organizationService.updateOrganizationProfile(
      userId,
      profileData
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Organization profile updated successfully",
    });
  } catch (error) {
    logger.error("Error updating organization profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get organization profile
exports.getOrganizationProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await organizationService.getOrganizationProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    logger.error("Error fetching organization profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update organization services
exports.updateOrganizationServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { description, serviceList } = req.body;

    if (!Array.isArray(serviceList)) {
      return res.status(400).json({ error: "Service list must be an array" });
    }

    logger.info(`Updating organization services for user: ${userId}`);
    const result = await organizationService.updateOrganizationServices(
      userId,
      { description, serviceList }
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({ message: "Services updated successfully" });
  } catch (error) {
    logger.error("Error updating services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get organization services
exports.getOrganizationServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const services = await organizationService.getOrganizationServices(userId);

    if (!services) {
      return res.status(404).json({ error: "Services not found" });
    }

    res.status(200).json(services);
  } catch (error) {
    logger.error("Error fetching organization services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update organization inventory
exports.updateOrganizationInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventoryData = req.body;

    logger.info(`Updating organization inventory for user: ${userId}`);
    const result = await organizationService.updateOrganizationInventory(
      userId,
      inventoryData
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({ message: "Inventory updated successfully" });
  } catch (error) {
    logger.error("Error updating inventory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get organization inventory
exports.getOrganizationInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventory = await organizationService.getOrganizationInventory(
      userId
    );

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    res.status(200).json(inventory);
  } catch (error) {
    logger.error("Error fetching organization inventory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
