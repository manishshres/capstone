const supportService = require("../services/supportService");
const { logger } = require("../utils/logger");

exports.createSupportRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { organizationId, ...requestData } = req.body;

    logger.info(`Attempting to create service request for user: ${userId}`);
    const result = await supportService.createSupportRequest(
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

exports.getSupportRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!requestId) {
      return res.status(400).json({ error: "Support Request ID is required" });
    }

    logger.info(`Attempting to retrieve support requests: ${requestId}`);
    const request = await supportService.getSupportRequestById(requestId);

    res.status(200).json(request);
  } catch (error) {
    logger.error("Error fetching service requests:", error);
    if (error.message === "Support request not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSupportRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;
    const updates = req.body;

    if (!requestId) {
      return res.status(400).json({ error: "Support Request ID is required" });
    }

    logger.info(`Attempting to update support request: ${requestId}`);
    const request = await supportService.getSupportRequestById(requestId);

    if (request.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden. Only the creator can update this request.",
      });
    }

    const updatedRequest = await supportService.updateSupportRequest(
      requestId,
      updates
    );
    res.status(200).json(updatedRequest);
  } catch (error) {
    logger.error("Error updating support request:", error);
    if (error.message === "Support request not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSupportRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accountType = req.user.accountType;
    let requests;
    //const { status, type } = req.query;

    logger.info(
      `Attempting to retrieve all support requests for user: ${userId}`
    );
    if (accountType === "org") {
      requests = await supportService.getSupportRequestsOrganization(userId);
    } else {
      requests = await supportService.getSupportRequestsUser(userId);
    }

    if (!requests || requests.length === 0) {
      return res.status(404).json({ error: "Support requests not found" });
    }

    res.status(200).json(requests);
  } catch (error) {
    logger.error("Error fetching service requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.respondToSupportRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const responseData = req.body;

    console.log(id);

    logger.info(`Attempting to respond to support request: ${id}`);
    const result = await supportService.respondToSupportRequest(
      userId,
      id,
      responseData
    );

    if (!result) {
      return res.status(404).json({ error: "Support request not found" });
    }

    res.status(200).json({ message: "Response added successfully" });
  } catch (error) {
    logger.error("Error responding to support request:", error);
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

exports.deleteSupportRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!requestId) {
      return res.status(400).json({ error: "Support Request ID is required" });
    }

    logger.info(`Attempting to delete support request: ${requestId}`);
    const request = await supportService.getSupportRequestById(requestId);

    if (request.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden. Only the creator can delete this request.",
      });
    }

    await supportService.deleteSupportRequest(requestId);
    res.status(200).json({ message: "Support request deleted successfully" });
  } catch (error) {
    logger.error("Error deleting support request:", error);
    if (error.message === "Support request not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
