const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const authenticateToken = require("../middlewares/authenticateToken");

router.use(authenticateToken);

router.get("/requests", supportController.getSupportRequests);
router.post("/new-request", supportController.createSupportRequest);
router.put("/request/:id", supportController.updateSupportRequestById);
router.put("/respond/:id", supportController.respondToSupportRequest);
router.get("/:id", supportController.getSupportRequestById);
router.delete("/:id", supportController.deleteSupportRequestById);

module.exports = router;
