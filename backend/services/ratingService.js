const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

const { logger } = require("../utils/logger");

exports.createRating = async (organizationId, userId, ratingData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const ratings = db.collection("ratings");

    // Check if organization exists
    const organization = await organizations.findOne({
      userId: organizationId,
    });
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if user has received support from the organization
    const supportRequests = db.collection("supports");
    const supportRequest = await supportRequests.findOne({
      userId,
      organizationId,
    });
    if (!supportRequest) {
      throw new Error("You have not received support from this organization");
    }

    // Create rating
    const newRating = {
      organizationId,
      userId,
      rating: ratingData.rating,
      comment: ratingData.comment,
      createdAt: new Date(),
    };

    const result = await ratings.insertOne(newRating);
    return result.insertedId;
  } catch (error) {
    logger.error("Error creating rating:", error, organizationId);
    throw error;
  }
};

exports.getRatingById = async (ratingId) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");

    const rating = await ratings.findOne({
      _id: ObjectId.createFromHexString(ratingId),
    });
    if (!rating) {
      throw new Error("Rating not found");
    }

    return rating;
  } catch (error) {
    logger.error("Error getting rating by id:", error);
    throw error;
  }
};

exports.updateRating = async (ratingId, updates) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");

    const result = await ratings.updateOne(
      { _id: ObjectId.createFromHexString(ratingId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      throw new Error("Rating not found");
    }

    return true;
  } catch (error) {
    logger.error("Error updating rating:", error);
    throw error;
  }
};

exports.getRatings = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");

    const ratingsList = await ratings.find({ organizationId }).toArray();
    return ratingsList;
  } catch (error) {
    logger.error("Error getting ratings:", error);
    throw error;
  }
};

// needs to add average
