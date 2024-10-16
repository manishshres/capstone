const express = require("express");
const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

// GET request for user is logged in
router.get("/", authenticateToken, authController.authStatus);

// POST request for registering a user
router.post("/register", authController.register);

// POST request for logging in a user
router.post("/login", authController.login);

module.exports = router;
