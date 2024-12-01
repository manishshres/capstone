const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

const { logger } = require("../utils/logger");

exports.createSupportRequest = async (userId, organizationId, requestData) => {
  try {
    const db = await connectToDatabase();
    const organizations = db.collection("organizations");
    const serviceRequests = db.collection("supports");

    // Verify organization exists
    const organization = await organizations.findOne({
      userId: organizationId,
    });
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Verify service exists and matches in organization's services
    const existingService = organization.services?.serviceList?.find(
      (service) =>
        service.id === requestData.serviceId &&
        service.name === requestData.serviceName &&
        service.type === requestData.serviceType
    );

    if (!existingService) {
      throw new Error("Service not found");
    }

    // Create request object
    const newRequest = {
      userId,
      organizationId,
      serviceId: requestData.serviceId,
      serviceName: requestData.serviceName,
      serviceType: requestData.serviceType,
      description: requestData.description,
      preferredContact: requestData.preferredContact,
      contactDetails: {
        email: requestData.contactDetails?.email || null,
        phone: requestData.contactDetails?.phone || null,
      },
      status: "pending",
      notes: requestData.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      responseData: null,
      history: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Request created",
        },
      ],
      serviceDetails: {
        id: existingService.id.toString(),
        name: existingService.name,
        type: existingService.type,
      },
    };

    const result = await serviceRequests.insertOne(newRequest);
    return {
      success: true,
      requestId: result.insertedId,
      serviceDetails: {
        id: existingService.id.toString(),
        name: existingService.name,
        type: existingService.type,
      },
    };
  } catch (error) {
    logger.error("Error in createSupportRequest:", error);
    throw error;
  }
};

exports.getSupportRequestById = async (requestId) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const request = await serviceRequests.findOne({
      _id: ObjectId.createFromHexString(requestId),
    });
    if (!request) {
      throw new Error("Support request not found");
    }

    return request;
  } catch (error) {
    logger.error("Error in getSupportRequestById:", error);
    throw error;
  }
};

exports.updateSupportRequest = async (requestId, updates) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const result = await serviceRequests.updateOne(
      { _id: ObjectId.createFromHexString(requestId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      throw new Error("Support request not found");
    }

    const updatedRequest = await serviceRequests.findOne({
      _id: ObjectId.createFromHexString(requestId),
    });
    return updatedRequest;
  } catch (error) {
    logger.error("Error updating support request:", error);
    throw error;
  }
};

exports.getSupportRequestsUser = async (userId) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const requests = await serviceRequests.find({ userId: userId }).toArray();

    return requests || [];
  } catch (error) {
    logger.error("Error in getSupportRequestsUser:", error);
    throw error;
  }
};

exports.getSupportRequestsOrganization = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const requests = await serviceRequests
      .find({
        organizationId: organizationId,
      })
      .toArray();

    return requests || [];
  } catch (error) {
    logger.error("Error in getSupportRequestsOrganization:", error);
    throw error;
  }
};

exports.updateSupportRequestStatus = async (
  organizationId,
  requestId,
  status,
  notes
) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const updateTime = new Date();

    const result = await serviceRequests.updateOne(
      {
        organizationId,
        _id: requestId,
      },
      {
        $set: {
          status,
          notes,
          updatedAt: updateTime,
        },
        $push: {
          history: {
            status,
            timestamp: updateTime,
            note: notes || `Status updated to ${status}`,
          },
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error in updateSupportRequestStatus:", error);
    throw error;
  }
};

exports.respondToSupportRequest = async (userId, id, responseData) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    let objectId;
    try {
      objectId = ObjectId.createFromHexString(id);
    } catch (error) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }

    const currentRequest = await serviceRequests.findOne({
      _id: objectId,
    });

    console.log(currentRequest);

    if (!currentRequest) {
      logger.error("Request not found for: ", id);
      throw new Error("Request not found for: ", id);
    }

    const updateTime = new Date();

    const result = await serviceRequests.updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          status: responseData.status,
          responseData: {
            ...responseData,
            updatedAt: updateTime,
          },
          updatedAt: updateTime,
        },
        $push: {
          history: {
            status: responseData.status,
            timestamp: updateTime,
            note: "Response added to request",
            responseDetails: responseData,
            serviceDetails: {
              id: currentRequest.serviceId,
              name: currentRequest.serviceName,
              type: currentRequest.serviceType,
            },
          },
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error in respondToSupportRequest:", error);
    throw error;
  }
};

exports.deleteSupportRequest = async (requestId) => {
  try {
    const db = await connectToDatabase();
    const serviceRequests = db.collection("supports");

    const result = await serviceRequests.deleteOne({
      _id: ObjectId.createFromHexString(requestId),
    });

    if (result.deletedCount === 0) {
      throw new Error("Support request not found");
    }

    return true;
  } catch (error) {
    logger.error("Error deleting support request:", error);
    throw error;
  }
};
