require("express-async-errors"); // Handles async errors in routes
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const supportRoutes = require("./routes/supportRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const errorHandler = require("./middlewares/errorHandler");

// remove this after you've confirmed it is working

const app = express();

// Middleware to handle CORS and body parsing
app.use(cors());
app.use(bodyParser.json());

// Route for related actions
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api", shelterRoutes);

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
