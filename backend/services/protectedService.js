const { connectToDatabase } = require("../config/mongoDbClient");

const addOrganization = async (organizationData, userId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");

    const result = await organizations.insertOne({
      ...organizationData,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: result.insertedId };
  } catch (error) {
    console.error("Error inserting organization into the database:", error);
    return { error: error.message };
  }
};

module.exports = {
  addOrganization,
};
