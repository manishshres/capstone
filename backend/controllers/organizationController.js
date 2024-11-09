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

exports.getOrganizationById = async (req, res) => {
  try {
    const orgId = req.params.id;

    if (!orgId) {
      return res.status(400).json({ error: "Organization ID is required" });
    }

    const organization = await organizationService.getOrganizationById(orgId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error) {
    logger.error("Error fetching organization by ID:", error);
    res.status(500).json({ error: "Failed to fetch organization details" });
  }
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
    const { description, serviceList } = req.body;

    // Ensure serviceList is an array of strings
    if (!Array.isArray(serviceList)) {
      return res.status(400).json({ error: "Service list must be an array" });
    }

    await organizationService.updateServices(userId, {
      description,
      serviceList,
    });

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
    if (error.message === "Organization not found") {
      return res.status(404).json({ error: "Organization not found" });
    }
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

exports.createServiceRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      organizationId,
      serviceName,
      description,
      preferredContact,
      contactDetails,
    } = req.body;

    // Validate required fields
    if (!organizationId || !serviceName || !description || !preferredContact) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide organizationId, serviceName, description, and preferredContact.",
      });
    }

    // Validate preferredContact
    if (!["email", "phone"].includes(preferredContact)) {
      return res.status(400).json({
        error:
          "Invalid preferredContact value. Must be either 'email' or 'phone'.",
      });
    }

    // Validate contactDetails based on preferredContact
    if (preferredContact === "email" && !contactDetails?.email) {
      return res.status(400).json({ error: "Email contact details required" });
    }
    if (preferredContact === "phone" && !contactDetails?.phone) {
      return res.status(400).json({ error: "Phone contact details required" });
    }

    const requestData = {
      serviceName,
      description,
      preferredContact,
      contactDetails,
      status: "pending",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await organizationService.createServiceRequest(
      userId,
      organizationId,
      requestData
    );

    logger.info(
      `Service request created for organization ${organizationId} by user ${userId}`
    );
    res.status(201).json({
      message: "Service request created successfully",
      requestId: result.requestId,
      status: "pending",
    });
  } catch (error) {
    logger.error("Error creating service request:", error);

    if (error.message === "Organization not found") {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (error.message === "Service not found") {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(500).json({ error: "Failed to create service request" });
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
