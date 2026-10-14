const express = require("express");
const {
  createTransferRequest,
  getMyTransfers,
  getPendingGovernmentTransfers,
  getTransferById,
  sellerVerification,
  buyerVerification,
  securityConfirmation,
  submitPaymentProof,
  governmentTransferDecision,
} = require("../controllers/transferController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Registrar initiates transfer
router.post("/", authorize("REGISTRAR", "ADMIN"), createTransferRequest);

// Citizen views their incoming / outgoing transfers
router.get("/my", getMyTransfers);

// Registrar views transfers awaiting final government decision
router.get("/pending-government", authorize("REGISTRAR", "ADMIN"), getPendingGovernmentTransfers);

// Get individual transfer details
router.get("/:id", getTransferById);

// Seller verification
router.patch("/:id/seller-verify", sellerVerification);

// Buyer verification
router.patch("/:id/buyer-verify", buyerVerification);

// Dual Security Credentials Confirmation (BhoomiCard PIN + Secret Code)
router.patch("/:id/security-confirm", securityConfirmation);

// Buyer payment proof submission (strictly non-cash: Bank Transfer / UPI / Cheque)
router.post("/:id/payment-proof", submitPaymentProof);

// Registrar final review & ledger recording
router.patch("/:id/government-decision", authorize("REGISTRAR", "ADMIN"), governmentTransferDecision);

module.exports = router;
