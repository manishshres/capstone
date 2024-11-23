const { connectToDatabase } = require("../config/mongoDbClient");
const { logger } = require("../utils/logger");

// Fetch organization document by user ID
const getOrganizationDocument = async (userId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    return organizations.findOne({ userId });
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

// exports.createServiceRequest = async (userId, organizationId, requestData) => {
//   try {
//     const db = await connectToDatabase();
//     const organizations = db.collection("organizations");
//     const serviceRequests = db.collection("serviceRequests");

//     // Verify organization exists
//     const organization = await organizations.findOne({
//       userId: organizationId,
//     });
//     if (!organization) {
//       const error = new Error("Organization not found");
//       error.code = "ORG_NOT_FOUND";
//       throw error;
//     }

//     // Verify service exists and matches in organization's services
//     const existingService = organization.services?.serviceList?.find(
//       (service) =>
//         service.id.toString() === requestData.serviceId &&
//         service.name === requestData.serviceName &&
//         service.type === requestData.serviceType
//     );

//     if (!existingService) {
//       const error = new Error("Service not found");
//       error.code = "SERVICE_NOT_FOUND";
//       throw error;
//     }

//     // Create request object
//     const newRequest = {
//       userId,
//       organizationId,
//       serviceId: requestData.serviceId,
//       serviceName: requestData.serviceName,
//       serviceType: requestData.serviceType,
//       description: requestData.description,
//       preferredContact: requestData.preferredContact,
//       contactDetails: {
//         email: requestData.contactDetails?.email || null,
//         phone: requestData.contactDetails?.phone || null,
//       },
//       status: "pending",
//       notes: requestData.notes || "",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       responseData: null,
//       history: [
//         {
//           status: "pending",
//           timestamp: new Date(),
//           note: "Request created",
//         },
//       ],
//       serviceDetails: {
//         id: existingService.id.toString(),
//         name: existingService.name,
//         type: existingService.type,
//       },
//     };

//     const result = await serviceRequests.insertOne(newRequest);
//     return {
//       success: true,
//       requestId: result.insertedId,
//       serviceDetails: {
//         id: existingService.id.toString(),
//         name: existingService.name,
//         type: existingService.type,
//       },
//     };
//   } catch (error) {
//     console.error("Error in createServiceRequest:", error);
//     throw error;
//   }
// };

// exports.getServiceRequests = async (
//   organizationId,
//   status = null,
//   serviceType = null
// ) => {
//   try {
//     const db = await connectToDatabase();
//     const serviceRequests = db.collection("serviceRequests");

//     // Build query based on filters
//     const query = { organizationId };
//     if (status) {
//       query.status = status;
//     }
//     if (serviceType) {
//       query.serviceType = serviceType;
//     }

//     const requests = await serviceRequests
//       .find(query)
//       .sort({ createdAt: -1 })
//       .toArray();

//     return requests || [];
//   } catch (error) {
//     console.error("Error in getServiceRequests:", error);
//     return [];
//   }
// };

// exports.updateServiceRequestStatus = async (
//   organizationId,
//   requestId,
//   status,
//   notes
// ) => {
//   try {
//     const db = await connectToDatabase();
//     const serviceRequests = db.collection("serviceRequests");

//     const updateTime = new Date();

//     const result = await serviceRequests.updateOne(
//       {
//         organizationId,
//         _id: requestId,
//       },
//       {
//         $set: {
//           status,
//           notes,
//           updatedAt: updateTime,
//         },
//         $push: {
//           history: {
//             status,
//             timestamp: updateTime,
//             note: notes || `Status updated to ${status}`,
//           },
//         },
//       }
//     );

//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error("Error in updateServiceRequestStatus:", error);
//     return false;
//   }
// };

// exports.respondToServiceRequest = async (
//   organizationId,
//   requestId,
//   responseData
// ) => {
//   try {
//     const db = await connectToDatabase();
//     const serviceRequests = db.collection("serviceRequests");

//     const currentRequest = await serviceRequests.findOne({
//       organizationId,
//       _id: requestId,
//     });

//     if (!currentRequest) {
//       return false;
//     }

//     const updateTime = new Date();

//     const result = await serviceRequests.updateOne(
//       {
//         organizationId,
//         _id: requestId,
//       },
//       {
//         $set: {
//           responseData: {
//             ...responseData,
//             updatedAt: updateTime,
//           },
//           updatedAt: updateTime,
//         },
//         $push: {
//           history: {
//             status: currentRequest.status,
//             timestamp: updateTime,
//             note: "Response added to request",
//             responseDetails: responseData,
//             serviceDetails: {
//               id: currentRequest.serviceId,
//               name: currentRequest.serviceName,
//               type: currentRequest.serviceType,
//             },
//           },
//         },
//       }
//     );

//     return result.modifiedCount > 0;
//   } catch (error) {
//     console.error("Error in respondToServiceRequest:", error);
//     return false;
//   }
// };
