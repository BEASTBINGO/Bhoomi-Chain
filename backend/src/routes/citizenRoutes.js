const express = require("express");

const {
  registerCitizen,
  loginCitizen,
  getCitizenProfile,
} = require("../controllers/citizenController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerCitizen);
router.post("/login", loginCitizen);
router.get("/profile", protect, getCitizenProfile);

module.exports = router;