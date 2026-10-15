const express = require("express");
const {
  loginRegistrar,
  getDashboardStats,
  getPendingProperties,
  getAllProperties,
  getPropertyReviewDetails,
  verifyPropertyRegistration,
  getAllTransfers,
  getLedger,
  verifyLedger,
  getAuditLogs,
  lookupCitizen,
  getCitizenProperties,
  getMasterRecords,
  checkMasterDatabase,
  autoCheckAndVerifyRegistration,
} = require("../controllers/governmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: Registrar Login (no token required)
router.post("/login", loginRegistrar);

// All routes below require REGISTRAR or ADMIN role
router.use(protect);
router.use(authorize("REGISTRAR", "ADMIN"));

router.get("/dashboard-stats", getDashboardStats);
router.get("/properties/pending", getPendingProperties);
router.get("/properties/all", getAllProperties);
router.get("/properties/:id", getPropertyReviewDetails);
router.patch("/properties/:id/verify", verifyPropertyRegistration);
router.get("/transfers/all", getAllTransfers);
router.get("/ledger", getLedger);
router.get("/ledger/verify", verifyLedger);
router.get("/audit-logs", getAuditLogs);

// Master Database & Citizen Lookup
router.get("/lookup-citizen/:bcid", lookupCitizen);
router.get("/citizen-properties/:bcid", getCitizenProperties);
router.get("/master-records", getMasterRecords);
router.post("/check-master-database", checkMasterDatabase);
router.post("/auto-check-registration", autoCheckAndVerifyRegistration);

module.exports = router;
