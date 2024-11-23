const { connectToDatabase } = require("../config/mongoDbClient");
const { logger } = require("../utils/logger");

// Fetch organization document by user ID
const getOrganizationDocument = async (userId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    // Query using $or to search by either userId or profile.org_id
    return organizations.findOne({
      $or: [{ userId }, { "profile.org_id": userId }],
    });
  } catch (error) {
    logger.error("Error fetching organization document:", error);
    throw error;
  }
};

// Get organization by ID
exports.getOrganizationById = async (orgId) => {
  try {
    const organization = await getOrganizationDocument(orgId);
    return organization;
  } catch (error) {
    logger.error("Error in getOrganizationById:", error);
    throw error;
  }
};

// Get organization profile
exports.getOrganizationProfile = async (orgId) => {
  try {
    const organization = await getOrganizationDocument(orgId);
    return organization?.profile;
  } catch (error) {
    logger.error("Error in getOrganizationProfile:", error);
    throw error;
  }
};

// Update organization profile
exports.updateOrganizationProfile = async (userId, profileData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const updateObj = {};

    // Build update object
    Object.keys(profileData).forEach((key) => {
      updateObj[`profile.${key}`] = profileData[key];
    });

    await organizations.updateOne(
      { userId },
      {
        $set: {
          ...updateObj,
          updatedAt: new Date(),
        },
      }
    );

    return { success: true };
  } catch (error) {
    logger.error("Error updating organization profile:", error);
    throw error;
  }
};

// Get organization services
exports.getOrganizationServices = async (userId) => {
  try {
    const organization = await getOrganizationDocument(userId);
    return organization?.services;
  } catch (error) {
    logger.error("Error fetching organization services:", error);
    throw error;
  }
};

// Update organization services
exports.updateOrganizationServices = async (userId, servicesData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");

    // Validate service list items
    const validatedServiceList = servicesData.serviceList.map((service) => ({
      id: service.id || Date.now() + Math.floor(Math.random() * 10000),
      name: service.name,
      type: service.type || "other",
      description: service.description || "",
      availability: service.availability || "always",
    }));

    await organizations.updateOne(
      { userId },
      {
        $set: {
          "services.description": servicesData.description || "",
          "services.serviceList": validatedServiceList,
          updatedAt: new Date(),
        },
      }
    );

    return { success: true };
  } catch (error) {
    logger.error("Error updating organization services:", error);
    throw error;
  }
};

// Get organization inventory
exports.getOrganizationInventory = async (userId) => {
  try {
    const organization = await getOrganizationDocument(userId);
    return organization?.inventory;
  } catch (error) {
    logger.error("Error fetching organization inventory:", error);
    throw error;
  }
};

// Update organization inventory
exports.updateOrganizationInventory = async (userId, inventoryData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");

    await organizations.updateOne(
      { userId },
      {
        $set: {
          "inventory.description": inventoryData.description || "",
          "inventory.inventoryList": inventoryData.inventoryList || [],
          updatedAt: new Date(),
        },
      }
    );

    return { success: true };
  } catch (error) {
    logger.error("Error updating organization inventory:", error);
    throw error;
  }
};
