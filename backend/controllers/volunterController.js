const volunteerService = require("../services/volunteerService");
const { logger } = require("../utils/logger");

exports.createVolunteerJob = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const jobData = req.body;

    // Basic validation
    if (
      !jobData.title ||
      !jobData.description ||
      !jobData.date ||
      !jobData.spots
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const result = await volunteerService.createVolunteerJob(
      organizationId,
      jobData
    );

    logger.info(`Volunteer job created by organization ${organizationId}`);
    res.status(201).json({
      message: "Volunteer job created successfully",
      job: result.job,
    });
  } catch (error) {
    logger.error("Error creating volunteer job:", error);
    res.status(500).json({
      error: "Failed to create volunteer job",
    });
  }
};

exports.updateVolunteerJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const organizationId = req.user.organizationId;
    const jobData = req.body;

    // Verify ownership
    const existingJob = await volunteerService.getVolunteerJobById(jobId);
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (existingJob.organizationId !== organizationId) {
      return res.status(403).json({ error: "Unauthorized to update this job" });
    }

    const result = await volunteerService.updateVolunteerJob(jobId, jobData);

    logger.info(
      `Volunteer job ${jobId} updated by organization ${organizationId}`
    );
    res.json({
      message: "Volunteer job updated successfully",
      job: result,
    });
  } catch (error) {
    logger.error("Error updating volunteer job:", error);
    res.status(500).json({
      error: "Failed to update volunteer job",
    });
  }
};

exports.getVolunteerJobs = async (req, res) => {
  try {
    const { city, state, type, skills, date, organizationId } = req.query;

    const filters = {};

    if (city) filters.city = city;
    if (state) filters.state = state;
    if (type) filters.type = type;
    if (skills) filters.skills = skills.split(",");
    if (date) filters.date = date;
    if (organizationId) filters.organizationId = organizationId;

    const jobs = await volunteerService.getVolunteerJobs(filters);

    res.json({
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    logger.error("Error fetching volunteer jobs:", error);
    res.status(500).json({
      error: "Failed to fetch volunteer jobs",
    });
  }
};

exports.getVolunteerJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await volunteerService.getVolunteerJobById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    logger.error("Error fetching volunteer job:", error);
    res.status(500).json({
      error: "Failed to fetch volunteer job",
    });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const volunteerId = req.user.id;
    const applicationData = req.body;

    // Check if job exists and has spots available
    const job = await volunteerService.getVolunteerJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.spots.available <= 0) {
      return res.status(400).json({ error: "No spots available for this job" });
    }

    // Check if already applied
    if (job.applications?.some((app) => app.volunteerId === volunteerId)) {
      return res.status(400).json({ error: "Already applied for this job" });
    }

    const result = await volunteerService.applyForJob(
      jobId,
      volunteerId,
      applicationData
    );

    logger.info(`Volunteer ${volunteerId} applied for job ${jobId}`);
    res.status(201).json({
      message: "Application submitted successfully",
      application: result.application,
    });
  } catch (error) {
    logger.error("Error applying for volunteer job:", error);
    res.status(500).json({
      error: "Failed to submit application",
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, volunteerId } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;

    // Verify organization owns the job
    const job = await volunteerService.getVolunteerJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.organizationId !== organizationId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this application" });
    }

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await volunteerService.updateApplicationStatus(
      jobId,
      volunteerId,
      status
    );

    logger.info(
      `Application status updated for volunteer ${volunteerId} on job ${jobId} to ${status}`
    );
    res.json({
      message: "Application status updated successfully",
      result,
    });
  } catch (error) {
    logger.error("Error updating application status:", error);
    res.status(500).json({
      error: "Failed to update application status",
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const applications = await volunteerService.getVolunteerApplications(
      volunteerId
    );

    res.json(applications);
  } catch (error) {
    logger.error("Error fetching volunteer applications:", error);
    res.status(500).json({
      error: "Failed to fetch applications",
    });
  }
};

exports.getOrganizationApplications = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { status, jobId } = req.query;

    const filters = {
      organizationId,
      ...(status && { status }),
      ...(jobId && { jobId }),
    };

    const applications = await volunteerService.getOrganizationApplications(
      filters
    );

    res.json(applications);
  } catch (error) {
    logger.error("Error fetching organization applications:", error);
    res.status(500).json({
      error: "Failed to fetch applications",
    });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const volunteerId = req.user.id;

    const result = await volunteerService.withdrawApplication(
      jobId,
      volunteerId
    );

    logger.info(
      `Volunteer ${volunteerId} withdrew application for job ${jobId}`
    );
    res.json({
      message: "Application withdrawn successfully",
      result,
    });
  } catch (error) {
    logger.error("Error withdrawing application:", error);
    res.status(500).json({
      error: "Failed to withdraw application",
    });
  }
};

exports.getJobStats = async (req, res) => {
  try {
    const { jobId } = req.params;
    const organizationId = req.user.organizationId;

    // Verify organization owns the job
    const job = await volunteerService.getVolunteerJobById(jobId);
    if (!job || job.organizationId !== organizationId) {
      return res.status(404).json({ error: "Job not found" });
    }

    const stats = await volunteerService.getJobStats(jobId);

    res.json(stats);
  } catch (error) {
    logger.error("Error fetching job stats:", error);
    res.status(500).json({
      error: "Failed to fetch job statistics",
    });
  }
};
