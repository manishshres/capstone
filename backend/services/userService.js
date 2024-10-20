const { connectToDatabase } = require("../config/mongoDbClient");

exports.getUserProfile = async (userId) => {
  const db = await connectToDatabase();
  const users = db.collection("users");
  return users.findOne({ _id: userId });
};

exports.updateUserProfile = async (userId, updateData) => {
  const db = await connectToDatabase();
  const users = db.collection("users");
  if (!users) {
    throw new Error("Users not found");
  }

  const result = await users.findOneAndUpdate(
    { _id: userId },
    { $set: updateData },
    { returnDocument: "after" }
  );
  return result.value;
};
