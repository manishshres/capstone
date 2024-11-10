const { connectToDatabase } = require("../config/mongoDbClient");
const { ObjectId } = require("mongodb");

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
    { _id: ObjectId(jobId) },
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

  const job = await volunteerJobs.findOne({ _id: ObjectId(jobId) });
  return job;
};

exports.applyForJob = async (jobId, volunteerId, applicationData) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const job = await volunteerJobs.findOne({ _id: ObjectId(jobId) });
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
    { _id: ObjectId(jobId) },
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
};

exports.updateApplicationStatus = async (jobId, volunteerId, status) => {
  const db = await connectToDatabase();
  const volunteerJobs = db.collection("volunteerJobs");

  const result = await volunteerJobs.updateOne(
    {
      _id: ObjectId(jobId),
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
