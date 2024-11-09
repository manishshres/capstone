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
