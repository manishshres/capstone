const organizationService = require("../services/organizationService");
const { logger } = require("../utils/logger");

exports.checkOrgAccountType = (req, res, next) => {
  if (req.user.accountType !== "org") {
    // console.log(req.user);
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

exports.updateServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const servicesData = req.body;

    await organizationService.updateServices(userId, servicesData);

    logger.info(`Services updated for organization: ${userId}`);
    res.status(200).json({ message: "Services updated successfully" });
  } catch (error) {
    logger.error("Error updating services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const services = await organizationService.getOrganizationServices(userId);
    res.status(200).json(services);
  } catch (error) {
    logger.error("Error fetching organization services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventoryData = req.body;

    await organizationService.updateInventory(userId, inventoryData);

    logger.info(`Services updated for organization: ${userId}`);
    res.status(200).json({ message: "Inventory updated successfully" });
  } catch (error) {
    logger.error("Error updating services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventory = await organizationService.getOrganizationInventory(
      userId
    );
    res.status(200).json(inventory);
  } catch (error) {
    logger.error("Error fetching organization inventory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getServiceRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = req.query.status; // Optional status filter

    const requests = await organizationService.getServiceRequests(
      userId,
      status
    );
    res.status(200).json(requests);
  } catch (error) {
    logger.error("Error fetching service requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getServiceRequestById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestId = req.params.requestId;

    const request = await organizationService.getServiceRequestById(
      userId,
      requestId
    );

    if (!request) {
      return res.status(404).json({ error: "Service request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    logger.error("Error fetching service request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { status, notes } = req.body;

    if (!["approved", "rejected", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await organizationService.updateServiceRequestStatus(
      userId,
      requestId,
      status,
      notes
    );

    if (!result) {
      return res.status(404).json({ error: "Service request not found" });
    }

    logger.info(`Service request ${requestId} status updated to ${status}`);
    res.status(200).json({
      message: "Service request status updated successfully",
      status,
    });
  } catch (error) {
    logger.error("Error updating service request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Respond to service request
exports.respondToServiceRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { response, availabilityDate, additionalInfo } = req.body;

    const result = await organizationService.respondToServiceRequest(
      userId,
      requestId,
      {
        response,
        availabilityDate,
        additionalInfo,
        respondedAt: new Date(),
      }
    );

    if (!result) {
      return res.status(404).json({ error: "Service request not found" });
    }

    logger.info(`Response added to service request ${requestId}`);
    res.status(200).json({
      message: "Response added successfully",
    });
  } catch (error) {
    logger.error("Error responding to service request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getServiceRequestStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const stats = await organizationService.getServiceRequestStats(
      userId,
      startDate,
      endDate
    );

    res.status(200).json(stats);
  } catch (error) {
    logger.error("Error fetching service request statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
