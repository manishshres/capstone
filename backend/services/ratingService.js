const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");
const { logger } = require("../utils/logger");

// This function remains the same
exports.getAverageRating = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const ratings = db.collection("ratings");

    // Find organization by _id or by profile.org_id
    let organization = await organizations.findOne({ _id: organizationId });

    if (!organization) {
      organization = await organizations.findOne({
        "profile.org_id": organizationId.toString(),
      });
    }

    // If organization doesn't exist, return default values
    if (!organization) {
      return { averageRating: 0, totalRatings: 0 };
    }

    const orgMongoId = organization.userId.toString();

    const pipeline = [
      { $match: { organizationId: orgMongoId } },
      {
        $group: {
          _id: "$organizationId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ];

    const result = await ratings.aggregate(pipeline).toArray();

    if (result.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    return {
      averageRating: Number(result[0].averageRating.toFixed(1)),
      totalRatings: result[0].totalRatings,
    };
  } catch (error) {
    logger.error("Error getting average rating:", error);
    return { averageRating: 0, totalRatings: 0 };
  }
};

exports.createRating = async (organizationId, userId, ratingData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const ratings = db.collection("ratings");

    // First try to find by _id
    let organization = await organizations.findOne({ _id: organizationId });

    // If not found, try to find by profile.org_id
    if (!organization) {
      organization = await organizations.findOne({
        "profile.org_id": organizationId.toString(),
      });
    }

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Use the organization's MongoDB userId for the rating
    const orgMongoId = organization.userId.toString();

    // Check if user has already rated this organization
    const existingRating = await ratings.findOne({
      organizationId: orgMongoId,
      userId,
    });

    if (existingRating) {
      // Update existing rating
      await ratings.updateOne(
        { _id: existingRating._id },
        {
          $set: {
            rating: ratingData.rating,
            comment: ratingData.comment,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new rating
      const newRating = {
        organizationId: orgMongoId,
        userId,
        rating: ratingData.rating,
        comment: ratingData.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await ratings.insertOne(newRating);
    }

    // After creating/updating a rating, update the organization's average rating
    const { averageRating, totalRatings } = await exports.getAverageRating(
      organizationId
    );

    // Store the computed averageRating and totalRatings in the organization document
    await organizations.updateOne(
      { _id: organization._id },
      {
        $set: {
          "rating.averageRating": averageRating,
          "rating.totalRatings": totalRatings,
        },
      }
    );

    return true;
  } catch (error) {
    logger.error("Error creating/updating rating:", error, organizationId);
    throw error;
  }
};

exports.updateRating = async (ratingId, updates) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");
    const organizations = db.collection("organizations");

    // Find the rating first to identify the organization
    const existingRating = await ratings.findOne({
      _id: ObjectId.createFromHexString(ratingId),
    });

    if (!existingRating) {
      throw new Error("Rating not found");
    }

    // Now find the corresponding organization by orgMongoId
    const orgMongoId = existingRating.organizationId;
    const organization = await organizations.findOne({ userId: orgMongoId });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update the rating
    const result = await ratings.updateOne(
      { _id: ObjectId.createFromHexString(ratingId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Rating not found");
    }

    // After updating the rating, recalculate average rating and update organization
    const { averageRating, totalRatings } = await exports.getAverageRating(
      organization._id
    );

    await organizations.updateOne(
      { _id: organization._id },
      {
        $set: {
          "rating.averageRating": averageRating,
          "rating.totalRatings": totalRatings,
        },
      }
    );

    return true;
  } catch (error) {
    logger.error("Error updating rating:", error);
    throw error;
  }
};

// The rest (getRatingById, getRatings) remains unchanged.
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

exports.getRatings = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const ratings = db.collection("ratings");

    let organization = await organizations.findOne({ _id: organizationId });
    if (!organization) {
      organization = await organizations.findOne({
        "profile.org_id": organizationId.toString(),
      });
    }

    if (!organization) {
      return [];
    }

    const orgMongoId = organization.userId.toString();
    const ratingsList = await ratings
      .find({ organizationId: orgMongoId })
      .toArray();

    return ratingsList;
  } catch (error) {
    logger.error("Error getting ratings:", error);
    return [];
  }
};
