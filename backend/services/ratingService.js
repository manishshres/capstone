const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

exports.createRating = async (userId, serviceRequestId, ratingData) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");
    const serviceRequests = db.collection("serviceRequests");
    const organizations = db.collection("organizations");
    const ratingStats = db.collection("organizationRatingStats");

    // Get service request details
    const serviceRequest = await serviceRequests.findOne({
      _id: serviceRequestId,
    });

    if (!serviceRequest) {
      throw new Error("Service request not found");
    }

    // Check if user has already rated this service request
    const existingRating = await ratings.findOne({
      userId,
      serviceRequestId,
    });

    if (existingRating) {
      throw new Error("You have already rated this service");
    }

    // Create rating
    const newRating = {
      userId,
      organizationId: serviceRequest.organizationId,
      serviceRequestId,
      serviceName: serviceRequest.serviceName,
      rating: ratingData.rating,
      feedback: ratingData.feedback,
      status: "active",
      images: ratingData.images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ratings.insertOne(newRating);

    // Update organization rating stats
    const stats = await ratingStats.findOne({
      organizationId: serviceRequest.organizationId,
    });

    if (stats) {
      // Update existing stats
      const newTotal = stats.totalRatings + 1;
      const newAverage =
        (stats.averageRating * stats.totalRatings + ratingData.rating) /
        newTotal;

      await ratingStats.updateOne(
        { organizationId: serviceRequest.organizationId },
        {
          $inc: {
            totalRatings: 1,
            [`ratingDistribution.${ratingData.rating}`]: 1,
          },
          $set: {
            averageRating: parseFloat(newAverage.toFixed(2)),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new stats
      await ratingStats.insertOne({
        organizationId: serviceRequest.organizationId,
        averageRating: ratingData.rating,
        totalRatings: 1,
        ratingDistribution: {
          1: ratingData.rating === 1 ? 1 : 0,
          2: ratingData.rating === 2 ? 1 : 0,
          3: ratingData.rating === 3 ? 1 : 0,
          4: ratingData.rating === 4 ? 1 : 0,
          5: ratingData.rating === 5 ? 1 : 0,
        },
        updatedAt: new Date(),
      });
    }

    return {
      success: true,
      ratingId: result.insertedId,
    };
  } catch (error) {
    //console.error("Error in createRating:", error);
    throw error;
  }
};

exports.getServiceRatings = async (serviceRequestId) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");

    return await ratings
      .find({
        serviceRequestId,
        status: "active",
      })
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error("Error in getServiceRatings:", error);
    throw error;
  }
};

exports.getOrganizationRatings = async (organizationId, options = {}) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");
    const users = db.collection("users");

    const { page = 1, limit = 10, minRating, maxRating } = options;
    const skip = (page - 1) * limit;

    const query = {
      organizationId,
      status: "active",
    };

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseInt(minRating);
      if (maxRating) query.rating.$lte = parseInt(maxRating);
    }

    const ratingsData = await ratings
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Enhance ratings with user info
    const enhancedRatings = await Promise.all(
      ratingsData.map(async (rating) => {
        const user = await users.findOne({ userId: rating.userId });
        return {
          ...rating,
          user: user
            ? {
                name: user.name,
                avatar: user.avatar,
              }
            : null,
        };
      })
    );

    const total = await ratings.countDocuments(query);

    return {
      ratings: enhancedRatings,
      metadata: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    //console.error("Error in getOrganizationRatings:", error);
    throw error;
  }
};

exports.getOrganizationRatingStats = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const ratingStats = db.collection("organizationRatingStats");

    const stats = await ratingStats.findOne({ organizationId });
    return (
      stats || {
        organizationId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      }
    );
  } catch (error) {
    console.error("Error in getOrganizationRatingStats:", error);
    throw error;
  }
};

exports.respondToRating = async (ratingId, organizationId, response) => {
  try {
    const db = await connectToDatabase();
    const ratings = db.collection("ratings");

    const result = await ratings.updateOne(
      {
        _id: ratingId,
        organizationId,
      },
      {
        $set: {
          response: {
            text: response,
            respondedAt: new Date(),
            respondedBy: organizationId,
          },
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error in respondToRating:", error);
    throw error;
  }
};
