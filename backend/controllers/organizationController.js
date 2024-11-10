const organizationService = require("../services/organizationService");
const { logger } = require("../utils/logger");

exports.checkOrgAccountType = (req, res, next) => {
  if (req.user.accountType !== "org") {
    return res
      .status(403)
      .json({ error: "Only organization accounts can access this resource" });
  }
  next();
};

exports.getOrganizationById = async (req, res) => {
  try {
    const orgId = req.params.id;
    if (!orgId) {
      return res.status(400).json({ error: "Organization ID is required" });
    }

    logger.info(`Attempting to fetch organization with ID: ${orgId}`);
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

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    logger.info(
      `Attempting to create/update organization profile for user: ${userId}`
    );
    const result = await organizationService.createOrUpdateProfile(
      userId,
      profileData
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Organization profile created/updated successfully",
      profile: result,
    });
  } catch (error) {
    logger.error("Error creating/updating organization profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info(
      `Attempting to retrieve organization profile for user: ${userId}`
    );

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

exports.updateServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { description, serviceList } = req.body;

    if (!Array.isArray(serviceList)) {
      return res.status(400).json({ error: "Service list must be an array" });
    }

    logger.info(
      `Attempting to update organization services for user: ${userId}`
    );
    const result = await organizationService.updateServices(userId, {
      description,
      serviceList,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({ message: "Services updated successfully" });
  } catch (error) {
    logger.error("Error updating services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getServices = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info(
      `Attempting to retrieve organization services for user: ${userId}`
    );

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

exports.updateInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventoryData = req.body;

    logger.info(
      `Attempting to update organization inventory for user: ${userId}`
    );
    const result = await organizationService.updateInventory(
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

exports.getInventory = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.info(
      `Attempting to retrieve organization inventory for user: ${userId}`
    );

    const inventory = await organizationService.getOrganizationInventory(
      userId
    );
    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    res.status(200).json(inventory);
  } catch (error) {
    logger.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createServiceRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { organizationId, ...requestData } = req.body;

    logger.info(`Attempting to create service request for user: ${userId}`);
    const result = await organizationService.createServiceRequest(
      userId,
      organizationId,
      requestData
    );

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      message: "Service request created successfully",
      requestId: result.requestId,
    });
  } catch (error) {
    logger.error("Error creating service request:", error);
    if (
      error.message === "Organization not found" ||
      error.message === "Service not found"
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getServiceRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, type } = req.query;

    logger.info(`Attempting to retrieve service requests for user: ${userId}`);
    const requests = await organizationService.getServiceRequests(
      userId,
      status,
      type
    );

    if (!requests || requests.length === 0) {
      return res.status(404).json({ error: "Service requests not found" });
    }

    res.status(200).json(requests);
  } catch (error) {
    logger.error("Error fetching service requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.respondToServiceRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const responseData = req.body;

    logger.info(`Attempting to respond to service request: ${requestId}`);
    const result = await organizationService.respondToServiceRequest(
      userId,
      requestId,
      responseData
    );

    if (!result) {
      return res.status(404).json({ error: "Service request not found" });
    }

    res.status(200).json({ message: "Response added successfully" });
  } catch (error) {
    logger.error("Error responding to service request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getServiceRequestStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    logger.info(
      `Attempting to fetch service request stats for user: ${userId}`
    );
    const stats = await organizationService.getServiceRequestStats(
      userId,
      startDate,
      endDate
    );

    res.status(200).json(stats);
  } catch (error) {
    logger.error("Error fetching service request statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
