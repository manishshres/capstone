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

exports.getOrganizationProfile = async (userId) => {
  const organization = await getOrganizationDocument(userId);
  if (!organization) {
    throw new Error("Organization profile not found");
  }
  return organization.profile;
};
