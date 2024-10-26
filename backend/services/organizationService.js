const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

const getOrganizationDocument = async (userId) => {
  const db = await connectToDatabase();
  const organizations = db.collection("organizations");
  return organizations.findOne({ userId: userId });
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
  const db = await connectToDatabase();
  const serviceRequests = db.collection("serviceRequests");

  const newRequest = {
    userId,
    organizationId,
    ...requestData,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await serviceRequests.insertOne(newRequest);
  return { success: true, requestId: result.insertedId };
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
