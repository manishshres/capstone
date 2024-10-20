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
