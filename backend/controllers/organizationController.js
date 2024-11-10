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

const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

const getOrganizationDocument = async (userId) => {
  const db = await connectToDatabase();
  const organizations = db.collection("organizations");
  return organizations.findOne({ userId: userId });
};

exports.getOrganizationById = async (orgId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");

    // Find organization by profile.org_id
    const organization = await organizations.findOne({
      "profile.org_id": orgId,
    });

    if (!organization) {
      return null;
    }

    return organization;
  } catch (error) {
    console.error("Error in getOrganizationById:", error);
    throw error;
  }
};

exports.createOrUpdateProfile = async (userId, profileData) => {
  const db = await connectToDatabase();
  const organizations = db.collection("organizations");

  const result = await organizations.updateOne(
    { userId: userId },
    {
      $set: {
        profile: profileData,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return { success: true, upsertedId: result.upsertedId };
};

exports.getOrganizationServices = async (userId) => {
  const organization = await getOrganizationDocument(userId);
  if (!organization) {
    throw new Error("Organization not found");
  }
  // console.log(organization);
  return organization.services;
};

exports.updateServices = async (userId, servicesData) => {
  const db = await connectToDatabase();
  const organizations = db.collection("organizations");

  await organizations.updateOne(
    { userId: userId },
    {
      $set: {
        services: servicesData,
        updatedAt: new Date(),
      },
    }
  );

  return { success: true };
};

exports.getOrganizationProfile = async (userId) => {
  const organization = await getOrganizationDocument(userId);
  if (!organization) {
    throw new Error("Organization profile not found");
  }
  return organization.profile;
};

exports.getOrganizationInventory = async (userId) => {
  const organization = await getOrganizationDocument(userId);
  if (!organization) {
    throw new Error("Organization not found");
  }
  // console.log(organization);
  return organization.inventory;
};

exports.updateInventory = async (userId, inventoryData) => {
  const db = await connectToDatabase();
  const organizations = db.collection("organizations");

  await organizations.updateOne(
    { userId: userId },
    {
      $set: {
        inventory: inventoryData,
        updatedAt: new Date(),
      },
    }
  );

  return { success: true };
};

exports.createServiceRequest = async (userId, organizationId, requestData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const serviceRequests = db.collection("serviceRequests");

    // Verify organization exists
    const organization = await organizations.findOne({
      userId: organizationId,
    });
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Verify service exists in organization's services
    const serviceExists = organization.services?.serviceList?.some(
      (service) =>
        service.id.toString() === requestData.serviceId &&
        service.name === requestData.serviceName &&
        service.type === requestData.serviceType
    );

    if (!serviceExists) {
      throw new Error("Service not found");
    }

    const newRequest = {
      userId,
      organizationId,
      ...requestData,
      responseData: null,
      history: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Request created",
        },
      ],
    };

    const result = await serviceRequests.insertOne(newRequest);
    return {
      success: true,
      requestId: result.insertedId,
    };
  } catch (error) {
    console.error("Error in createServiceRequest:", error);
    throw error;
  }
};

exports.getServiceRequests = async (organizationId, status = null) => {
  const db = await connectToDatabase();
  const serviceRequests = db.collection("serviceRequests");

  const query = { organizationId };
  if (status) {
    query.status = status;
  }

  return await serviceRequests.find(query).sort({ createdAt: -1 }).toArray();
};

exports.getServiceRequestById = async (organizationId, requestId) => {
  const db = await connectToDatabase();
  const serviceRequests = db.collection("serviceRequests");

  return await serviceRequests.findOne({
    organizationId,
    _id: requestId,
  });
};

exports.updateServiceRequestStatus = async (
  organizationId,
  requestId,
  status,
  notes
) => {
  const db = await connectToDatabase();
  const serviceRequests = db.collection("serviceRequests");

  const result = await serviceRequests.updateOne(
    {
      organizationId,
      _id: requestId,
    },
    {
      $set: {
        status,
        notes,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
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
