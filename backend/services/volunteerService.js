const { connectToDatabase } = require("../config/mongoDbClient");
// import { ObjectId } from "bson";
const { ObjectId } = require("mongodb");

const getObjectID = (jobId) => {
  let objectId;
  try {
    objectId = ObjectId.createFromHexString(jobId);
    return objectId;
  } catch (error) {
    throw new Error(`Invalid ObjectId format: ${jobId}`);
  }
};
exports.createVolunteerJob = async (organizationId, jobData) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const job = {
    organizationId,
    title: jobData.title,
    description: jobData.description,
    type: jobData.type,
    date: new Date(jobData.date),
    startTime: jobData.startTime,
    endTime: jobData.endTime,
    location: {
      name: jobData.location,
      address: jobData.address,
      city: jobData.city,
      state: jobData.state,
      zipCode: jobData.zipCode,
    },
    spots: {
      total: parseInt(jobData.spots),
      available: parseInt(jobData.spots),
      filled: 0,
    },
    requirements: jobData.requirements,
    benefits: jobData.benefits,
    skills: jobData.skills || [],
    responsibilities: jobData.responsibilities || [],
    schedule: {
      frequency: jobData.schedule?.frequency || "oneTime",
      days: jobData.schedule?.days || [],
      duration: jobData.schedule?.duration,
    },
    contact: {
      name: jobData.contact?.name,
      email: jobData.contact?.email,
      phone: jobData.contact?.phone,
    },
    status: "active",
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await volunteerJobs.insertOne(job);
  return {
    success: true,
    jobId: result.insertedId,
    job: { ...job, _id: result.insertedId },
  };
};

exports.updateVolunteerJob = async (jobId, jobData) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const updateData = {
    title: jobData.title,
    description: jobData.description,
    type: jobData.type,
    date: new Date(jobData.date),
    startTime: jobData.startTime,
    endTime: jobData.endTime,
    location: {
      name: jobData.location,
      address: jobData.address,
      city: jobData.city,
      state: jobData.state,
      zipCode: jobData.zipCode,
    },
    spots: {
      total: parseInt(jobData.spots),
      available: parseInt(jobData.spots),
    },
    requirements: jobData.requirements,
    benefits: jobData.benefits,
    skills: jobData.skills || [],
    responsibilities: jobData.responsibilities || [],
    schedule: {
      frequency: jobData.schedule?.frequency || "oneTime",
      days: jobData.schedule?.days || [],
      duration: jobData.schedule?.duration,
    },
    contact: {
      name: jobData.contact?.name,
      email: jobData.contact?.email,
      phone: jobData.contact?.phone,
    },
    updatedAt: new Date(),
  };

  const result = await volunteerJobs.updateOne(
    { _id: getObjectID(jobId) },
    { $set: updateData }
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
  };
};

exports.getVolunteerJobs = async (filters = {}) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const query = { status: "active" };

  // Add filters
  if (filters.organizationId) {
    query.organizationId = filters.organizationId;
  }
  if (filters.city) {
    query["location.city"] = new RegExp(filters.city, "i");
  }
  if (filters.state) {
    query["location.state"] = filters.state;
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.skills) {
    query.skills = { $in: filters.skills };
  }
  if (filters.date) {
    query.date = { $gte: new Date(filters.date) };
  }

  const jobs = await volunteerJobs
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return jobs;
};

exports.getVolunteerJobById = async (jobId) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const job = await volunteerJobs.findOne({ _id: getObjectID(jobId) });
  return job;
};

exports.getPostedVolunteerJobs = async (organizationId) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const jobs = await volunteerJobs.find({ organizationId }).toArray();
  return jobs;
};

exports.applyForJob = async (jobId, volunteerId, applicationData) => {
  try {
    if (!jobId || !volunteerId || !applicationData) {
      throw new Error("Invalid input parameters");
    }

    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");

    const job = await volunteerJobs.findOne({ _id: getObjectID(jobId) });
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.spots.available <= 0) {
      throw new Error("No spots available");
    }

    const application = {
      volunteerId,
      status: "pending",
      appliedAt: new Date(),
      ...applicationData,
    };

    const result = await volunteerJobs.updateOne(
      { _id: getObjectID(jobId) },
      {
        $push: { applications: application },
        $inc: { "spots.available": -1, "spots.filled": 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return {
      success: true,
      application,
    };
  } catch (error) {
    //console.error(error);
    throw error;
  }
};

exports.updateApplicationStatus = async (jobId, volunteerId, status) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const result = await volunteerJobs.updateOne(
    {
      _id: getObjectID(jobId),
      "applications.volunteerId": volunteerId,
    },
    {
      $set: {
        "applications.$.status": status,
        "applications.$.updatedAt": new Date(),
        updatedAt: new Date(),
      },
    }
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
  };
};

exports.getOrganizationApplications = async (filters) => {
  try {
    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");
    const users = db.collection("users");

    // Find all jobs for this organization that have applications
    const query = {
      organizationId: filters.organizationId,
      "applications.0": { $exists: true },
    };

    const jobs = await volunteerJobs.find(query).toArray();

    // Extract and format all applications from these jobs
    let allApplications = [];

    for (const job of jobs) {
      for (const app of job.applications) {
        // Get user information for each application
        const volunteer = await users.findOne(
          { _id: app.volunteerId },
          { projection: { name: 1, email: 1 } }
        );

        allApplications.push({
          _id: app._id || new ObjectId(),
          jobId: job._id,
          job: {
            _id: job._id,
            title: job.title,
            description: job.description,
            date: job.date,
            location: job.location,
          },
          volunteerId: app.volunteerId,
          volunteer: volunteer
            ? {
                _id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
              }
            : null,
          status: app.status,
          appliedAt: app.appliedAt,
          motivationLetter: app.motivationLetter,
          experience: app.experience,
          availability: app.availability,
          skills: app.skills || [],
        });
      }
    }

    // Apply filters
    let filteredApplications = allApplications;

    if (filters.status) {
      filteredApplications = filteredApplications.filter(
        (app) => app.status === filters.status
      );
    }

    if (filters.jobId) {
      filteredApplications = filteredApplications.filter(
        (app) => app.jobId.toString() === filters.jobId
      );
    }

    // Sort by most recent first
    filteredApplications.sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    return filteredApplications;
  } catch (error) {
    console.error("Error in getOrganizationApplications:", error);
    throw error;
  }
};

exports.getVolunteerApplications = async (volunteerId) => {
  try {
    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");

    // Get all jobs with applications
    const allJobs = await volunteerJobs
      .find({ "applications.0": { $exists: true } })
      .toArray();

    // Manually filter to see all applications
    let applications = [];

    for (const job of allJobs) {
      const matchingApplications = job.applications.filter(
        (app) => app.volunteerId === volunteerId
      );

      if (matchingApplications.length > 0) {
        const formattedApps = matchingApplications.map((app) => ({
          _id: app._id || new ObjectId(),
          job: {
            _id: job._id,
            title: job.title,
            description: job.description,
            date: job.date,
            startTime: job.startTime,
            endTime: job.endTime,
            location: job.location,
            organization: {
              id: job.organizationId,
              name: job.contact.name,
              email: job.contact.email,
            },
          },
          status: app.status,
          appliedAt: app.appliedAt,
          motivationLetter: app.motivationLetter,
          experience: app.experience,
          availability: app.availability,
          skills: app.skills || [],
          comments: app.comments,
        }));

        applications = [...applications, ...formattedApps];
      }
    }

    // Sort by application date (most recent first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    console.log("Found applications:", applications.length);
    return applications;
  } catch (error) {
    console.error("Error in getVolunteerApplications:", error);
    throw error;
  }
};

exports.withdrawApplication = async (jobId, volunteerId) => {
  try {
    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");

    console.log(jobId, volunteerId);

    // First find the job and verify the application exists
    const job = await volunteerJobs.findOne({
      _id: getObjectID(jobId),
      "applications.volunteerId": volunteerId,
    });

    if (!job) {
      throw new Error("Application not found");
    }

    // Update the job document to remove the application and adjust spots
    const result = await volunteerJobs.updateOne(
      { _id: getObjectID(jobId) },
      {
        $pull: {
          applications: { volunteerId: volunteerId },
        },
        $inc: {
          "spots.available": 1,
          "spots.filled": -1,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      result: result,
    };
  } catch (error) {
    console.error("Error in withdrawApplication:", error);
    throw error;
  }
};

exports.getOrganizationVolunteers = async (organizationId) => {
  try {
    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");
    const users = db.collection("users");

    // Find all jobs for this organization
    const jobs = await volunteerJobs
      .find({
        organizationId,
        "applications.0": { $exists: true },
      })
      .toArray();

    // Get unique volunteer IDs from all applications
    const volunteerIds = new Set();
    jobs.forEach((job) => {
      job.applications.forEach((app) => {
        if (app.status === "approved") {
          volunteerIds.add(app.volunteerId);
        }
      });
    });

    // Get volunteer details and their applications
    const volunteers = await Promise.all(
      Array.from(volunteerIds).map(async (volunteerId) => {
        const volunteer = await users.findOne(
          { _id: volunteerId },
          { projection: { password: 0 } }
        );

        if (!volunteer) return null;

        // Get all applications for this volunteer
        const applications = jobs
          .map((job) => ({
            job: {
              _id: job._id,
              title: job.title,
              date: job.date,
              location: job.location,
            },
            application: job.applications.find(
              (app) => app.volunteerId === volunteerId
            ),
          }))
          .filter((item) => item.application);

        return {
          _id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          applications: applications,
          totalHours: applications.reduce(
            (total, app) => total + (app.application.hoursCompleted || 0),
            0
          ),
        };
      })
    );

    return volunteers.filter(Boolean);
  } catch (error) {
    console.error("Error in getOrganizationVolunteers:", error);
    throw error;
  }
};

exports.updateVolunteerHours = async (jobId, volunteerId, hours) => {
  try {
    const db = await connectToDatabase();
    const volunteerJobs = db.collection("volunteerJobs");

    const result = await volunteerJobs.updateOne(
      {
        _id: new ObjectId(jobId),
        "applications.volunteerId": volunteerId,
      },
      {
        $set: {
          "applications.$.hoursCompleted": hours,
          "applications.$.lastUpdated": new Date(),
        },
      }
    );

    return { success: true, result };
  } catch (error) {
    console.error("Error in updateVolunteerHours:", error);
    throw error;
  }
};
