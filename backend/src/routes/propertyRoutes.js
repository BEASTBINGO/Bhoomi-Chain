const express = require("express");

const {
  createProperty,
  getMyProperties,
  getPropertyById,
  getPropertyOwnershipHistory,
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProperty);
router.get("/my", protect, getMyProperties);
router.get("/:id", protect, getPropertyById);
router.get("/:id/ownership-history", protect, getPropertyOwnershipHistory);

module.exports = router;