const mongoose = require("mongoose");
const TransferRequest = require("../models/TransferRequest");
const PaymentProof = require("../models/PaymentProof");
const Property = require("../models/Property");
const User = require("../models/User");
const OwnershipHistory = require("../models/OwnershipHistory");
const GovernmentOffice = require("../models/GovernmentOffice");
const AuditLog = require("../models/AuditLog");
const { appendLedgerRecord } = require("../services/blockchainLedgerService");

const generateTransferRequestId = async () => {
  const year = new Date().getFullYear();
  const count = await TransferRequest.countDocuments();
  const counter = String(count + 1).padStart(6, "0");
  return `TR-${year}-${counter}`;
};

/**
 * Step 1: Registrar creates a property transfer request
 */
const createTransferRequest = async (req, res) => {
  try {
    const { propertyId, buyerBcid, agreedAmount, transferType, remarks } = req.body;

    if (!propertyId || !buyerBcid || !agreedAmount) {
      return res.status(400).json({
        success: false,
        message: "propertyId, buyerBcid and agreedAmount are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid propertyId format",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.verificationStatus !== "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Only government-VERIFIED properties are eligible for transfer",
      });
    }

    if (property.status === "TRANSFER_PENDING") {
      return res.status(400).json({
        success: false,
        message: "This property already has an active pending transfer in progress",
      });
    }

    const buyer = await User.findOne({ bcid: buyerBcid });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: `Buyer with BCID '${buyerBcid}' not found`,
      });
    }

    if (buyer._id.toString() === property.currentOwner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Buyer cannot be the current owner of the property",
      });
    }

    const office = await GovernmentOffice.findOne({ status: "ACTIVE" });
    const transferRequestId = await generateTransferRequestId();

    const transferRequest = await TransferRequest.create({
      transferRequestId,
      property: property._id,
      seller: property.currentOwner,
      buyer: buyer._id,
      registrar: req.user.userId,
      governmentOffice: office?._id,
      agreedAmount: Number(agreedAmount),
      transferType: transferType || "SALE",
      status: "SELLER_ACCEPTANCE_PENDING",
      remarks,
    });

    // Mark property as transfer pending to prevent concurrent transfers
    property.status = "TRANSFER_PENDING";
    await property.save();

    await AuditLog.create({
      actor: req.user.userId,
      actorRole: req.user.role || "REGISTRAR",
      action: "TRANSFER_REQUEST_CREATED",
      entityType: "TransferRequest",
      entityId: String(transferRequest._id),
      metadata: {
        transferRequestId,
        propertyCode: property.propertyCode,
        agreedAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: "Transfer request initiated successfully. Awaiting seller acceptance.",
      transferRequest,
    });
  } catch (error) {
    console.error("Create transfer request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate transfer request",
      error: error.message,
    });
  }
};

/**
 * Fetch transfers involving the logged-in citizen (as seller or buyer)
 * Strict requirement: Buyer cannot see transfer until seller has accepted!
 */
const getMyTransfers = async (req, res) => {
  try {
    const userId = req.user.userId.toString();

    const allTransfers = await TransferRequest.find({
      $or: [{ seller: userId }, { buyer: userId }],
    })
      .populate("property", "propertyCode surveyNumber propertyType district address area areaUnit marketValue")
      .populate("seller", "fullName bcid mobile aadhaarNumber")
      .populate("buyer", "fullName bcid mobile aadhaarNumber")
      .populate("governmentOffice", "officeName officeCode")
      .sort({ createdAt: -1 });

    // Filter out transfers for buyer if seller has not accepted yet
    const visibleTransfers = allTransfers.filter((t) => {
      const isSeller = t.seller?._id ? t.seller._id.toString() === userId : t.seller?.toString() === userId;
      const isBuyer = t.buyer?._id ? t.buyer._id.toString() === userId : t.buyer?.toString() === userId;

      if (isBuyer && !isSeller) {
        // Buyer only sees after seller has accepted
        if (t.status === "SELLER_ACCEPTANCE_PENDING" || t.status === "SELLER_VERIFICATION_PENDING") {
          return false;
        }
      }
      return true;
    });

    res.json({
      success: true,
      count: visibleTransfers.length,
      transfers: visibleTransfers,
    });
  } catch (error) {
    console.error("Get my transfers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfers",
      error: error.message,
    });
  }
};

/**
 * Fetch all transfers pending government review (for registrar dashboard)
 */
const getPendingGovernmentTransfers = async (req, res) => {
  try {
    const transfers = await TransferRequest.find({
      status: "GOVERNMENT_REVIEW",
    })
      .populate("property")
      .populate("seller", "fullName bcid mobile")
      .populate("buyer", "fullName bcid mobile")
      .populate("governmentOffice", "officeName officeCode")
      .sort({ createdAt: -1 });

    // Attach payment proofs
    const transfersWithPayment = await Promise.all(
      transfers.map(async (t) => {
        const payment = await PaymentProof.findOne({ transferRequest: t._id });
        return {
          ...t.toObject(),
          paymentProof: payment,
        };
      })
    );

    res.json({
      success: true,
      count: transfersWithPayment.length,
      transfers: transfersWithPayment,
    });
  } catch (error) {
    console.error("Get pending transfers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending transfer reviews",
      error: error.message,
    });
  }
};

/**
 * Get transfer details by ID
 */
const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer ID format",
      });
    }

    const transfer = await TransferRequest.findById(id)
      .populate("property")
      .populate("seller", "fullName bcid mobile address")
      .populate("buyer", "fullName bcid mobile address")
      .populate("registrar", "fullName bcid")
      .populate("governmentOffice", "officeName officeCode district");

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found",
      });
    }

    const paymentProof = await PaymentProof.findOne({ transferRequest: id });

    res.json({
      success: true,
      transfer,
      paymentProof,
    });
  } catch (error) {
    console.error("Get transfer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer request",
      error: error.message,
    });
  }
};

/**
 * Step 2: Seller digital verification (Accept / Reject)
 */
const sellerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body || {};

    if (!["ACCEPT", "REJECT"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be 'ACCEPT' or 'REJECT'",
      });
    }

    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found",
      });
    }

    if (transfer.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the designated seller can verify this transfer request",
      });
    }

    const isSellerPending =
      transfer.status === "SELLER_ACCEPTANCE_PENDING" ||
      transfer.status === "SELLER_VERIFICATION_PENDING";

    if (!isSellerPending) {
      return res.status(400).json({
        success: false,
        message: `Cannot verify: current status is '${transfer.status}'`,
      });
    }

    if (decision === "ACCEPT") {
      transfer.status = "BUYER_ACCEPTANCE_PENDING";
      transfer.sellerAcceptedAt = new Date();
      transfer.sellerVerifiedAt = new Date();
      await transfer.save();

      return res.json({
        success: true,
        message: "Seller acceptance confirmed! Transfer request is now forwarded to the Buyer for acceptance.",
        transfer,
      });
    } else {
      transfer.status = "CANCELLED";
      transfer.rejectionReason = reason || "Declined by seller";
      await transfer.save();

      // Restore property status to active
      await Property.findByIdAndUpdate(transfer.property, { status: "ACTIVE" });

      return res.json({
        success: true,
        message: "Transfer declined by seller. Request cancelled.",
        transfer,
      });
    }
  } catch (error) {
    console.error("Seller verify error:", error);
    res.status(500).json({
      success: false,
      message: "Seller verification failed",
      error: error.message,
    });
  }
};

/**
 * Step 3: Buyer digital verification (Accept / Reject)
 * Once buyer accepts, request turns into Security Credentials Confirmation Form for BOTH parties!
 */
const buyerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body || {};

    if (!["ACCEPT", "REJECT"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be 'ACCEPT' or 'REJECT'",
      });
    }

    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found",
      });
    }

    if (transfer.buyer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the designated buyer can verify this transfer request",
      });
    }

    const isBuyerPending =
      transfer.status === "BUYER_ACCEPTANCE_PENDING" ||
      transfer.status === "BUYER_VERIFICATION_PENDING";

    if (!isBuyerPending) {
      return res.status(400).json({
        success: false,
        message: `Cannot verify: current status is '${transfer.status}'`,
      });
    }

    if (decision === "ACCEPT") {
      transfer.status = "SECURITY_CONFIRMATION_PENDING";
      transfer.buyerAcceptedAt = new Date();
      transfer.buyerVerifiedAt = new Date();
      await transfer.save();

      return res.json({
        success: true,
        message: "Buyer acceptance confirmed! Both parties must now confirm digital BhoomiCard security credentials to authorize transfer.",
        transfer,
      });
    } else {
      transfer.status = "CANCELLED";
      transfer.rejectionReason = reason || "Declined by buyer";
      await transfer.save();

      await Property.findByIdAndUpdate(transfer.property, { status: "ACTIVE" });

      return res.json({
        success: true,
        message: "Transfer declined by buyer. Request cancelled.",
        transfer,
      });
    }
  } catch (error) {
    console.error("Buyer verify error:", error);
    res.status(500).json({
      success: false,
      message: "Buyer verification failed",
      error: error.message,
    });
  }
};

/**
 * Step 3.5: Dual Security Credentials Confirmation (Digital BhoomiCard)
 * Both Seller and Buyer must confirm with:
 * - BCID / ID Number
 * - Aadhaar Card Number
 * - Secret Code on Card
 * - Secret PIN
 * - Phone Number
 */
const securityConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const { bcid, aadhaarNumber, secretCardCode, secretPin, cardPin, phone, mobile } = req.body;
    const pin = secretPin || cardPin;
    const contact = mobile || phone;

    if (!bcid || !aadhaarNumber || !secretCardCode || !pin || !contact) {
      return res.status(400).json({
        success: false,
        message: "BCID, Aadhaar Number, Secret Card Code, Card PIN, and Phone Number are all required for security confirmation",
      });
    }

    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer request not found" });
    }

    const isSeller = transfer.seller.toString() === req.user.userId;
    const isBuyer = transfer.buyer.toString() === req.user.userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized as seller or buyer for this transfer request",
      });
    }

    if (transfer.status !== "SECURITY_CONFIRMATION_PENDING") {
      return res.status(400).json({
        success: false,
        message: `Security confirmation can only be performed when status is SECURITY_CONFIRMATION_PENDING. Current status: '${transfer.status}'`,
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    // Verify user ID
    if (user.bcid.toUpperCase() !== bcid.trim().toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: "BhoomiChain ID (BCID) does not match your active logged-in card account",
      });
    }

    // Verify Aadhaar (digits only comparison)
    const dbAadhaar = (user.aadhaarNumber || "").replace(/\D/g, "");
    const inAadhaar = aadhaarNumber.replace(/\D/g, "");
    if (dbAadhaar && inAadhaar && dbAadhaar !== inAadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number does not match your registered BhoomiCard credentials",
      });
    }

    // Verify Card Secret Code
    const dbCode = user.secretCardCode || "789";
    if (secretCardCode.trim() !== dbCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid 3-digit Secret Card Code (CVC) on your digital card",
      });
    }

    // Verify Secret PIN
    const dbPin = user.secretPin || "1234";
    if (pin.trim() !== dbPin) {
      return res.status(400).json({
        success: false,
        message: "Invalid Card Security PIN entered",
      });
    }

    // Verify Mobile
    const dbPhone = (user.mobile || "").replace(/\D/g, "");
    const inPhone = contact.replace(/\D/g, "");
    if (dbPhone && inPhone && !dbPhone.includes(inPhone) && !inPhone.includes(dbPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number does not match your registered card records",
      });
    }

    const confirmationData = {
      bcid: user.bcid,
      aadhaarNumber: user.aadhaarNumber,
      secretCardCode: secretCardCode.trim(),
      cardPin: "••••",
      phone: user.mobile,
    };

    if (isSeller) {
      transfer.sellerSecurityConfirmed = true;
      transfer.sellerSecurityConfirmedAt = new Date();
      transfer.sellerConfirmationData = confirmationData;
    } else if (isBuyer) {
      transfer.buyerSecurityConfirmed = true;
      transfer.buyerSecurityConfirmedAt = new Date();
      transfer.buyerConfirmationData = confirmationData;
    }

    // Check if BOTH have now completed the security confirmation
    let waitParty = "";
    if (transfer.sellerSecurityConfirmed && transfer.buyerSecurityConfirmed) {
      transfer.status = "PAYMENT_PENDING";
    } else if (transfer.sellerSecurityConfirmed && !transfer.buyerSecurityConfirmed) {
      waitParty = "buyer";
    } else if (!transfer.sellerSecurityConfirmed && transfer.buyerSecurityConfirmed) {
      waitParty = "seller";
    }

    await transfer.save();

    await AuditLog.create({
      actor: req.user.userId,
      actorRole: "CITIZEN",
      action: isSeller ? "SELLER_SECURITY_CONFIRMED" : "BUYER_SECURITY_CONFIRMED",
      entityType: "TransferRequest",
      entityId: String(transfer._id),
      metadata: {
        isSeller,
        isBuyer,
        status: transfer.status,
      },
    });

    res.json({
      success: true,
      message: transfer.status === "PAYMENT_PENDING"
        ? "Both seller and buyer security credentials confirmed! Proceeding to payment stage."
        : `Security credentials verified. Waiting for ${waitParty} to complete this step.`,
      status: transfer.status,
      sellerSecurityConfirmed: transfer.sellerSecurityConfirmed,
      buyerSecurityConfirmed: transfer.buyerSecurityConfirmed,
      transfer,
    });
  } catch (error) {
    console.error("Security confirmation error:", error);
    res.status(500).json({
      success: false,
      message: "Security confirmation failed",
      error: error.message,
    });
  }
};

/**
 * Step 4: Buyer submits payment reference proof
 * STRICT REQUIREMENT: NO CASH PAYMENT. Only Bank Transfer, UPI, or Cheque/DD accepted!
 */
const submitPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentReference, paymentMode, amount, bankName, remarks } = req.body;

    if (!paymentReference || !paymentMode || !amount) {
      return res.status(400).json({
        success: false,
        message: "paymentReference, paymentMode, and amount are required",
      });
    }

    if (paymentMode === "CASH") {
      return res.status(400).json({
        success: false,
        message: "Cash payments are strictly prohibited by Government Land Registry guidelines. Only Bank-to-Bank Transfer, UPI, or Cheque/DD are accepted.",
      });
    }

    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found",
      });
    }

    if (transfer.buyer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the buyer can submit payment proof for this transfer",
      });
    }

    if (transfer.status !== "PAYMENT_PENDING") {
      return res.status(400).json({
        success: false,
        message: `Payment can only be submitted when status is PAYMENT_PENDING. Current: '${transfer.status}'`,
      });
    }

    const proof = await PaymentProof.create({
      transferRequest: transfer._id,
      paymentReference,
      paymentMode,
      amount: Number(amount),
      paymentDate: new Date(),
      verificationStatus: "PENDING",
      verificationSource: "DEMO_VALIDATION",
      remarks,
    });

    transfer.paymentDetails = {
      paymentMode,
      referenceNumber: paymentReference,
      bankName: bankName || (paymentMode === "UPI" ? "National UPI Switch" : "State Bank of India"),
      amount: Number(amount),
      paymentDate: new Date(),
      notes: remarks || "",
    };

    transfer.status = "GOVERNMENT_REVIEW";
    transfer.paymentSubmittedAt = new Date();
    await transfer.save();

    await AuditLog.create({
      actor: req.user.userId,
      actorRole: "CITIZEN",
      action: "PAYMENT_PROOF_SUBMITTED",
      entityType: "PaymentProof",
      entityId: String(proof._id),
      metadata: {
        paymentReference,
        amount,
        paymentMode,
      },
    });

    res.status(201).json({
      success: true,
      message: "Non-cash payment proof recorded. Transfer request is now submitted for Government Review and Blockchain Sealing.",
      transfer,
      paymentProof: proof,
    });
  } catch (error) {
    console.error("Payment proof error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit payment proof",
      error: error.message,
    });
  }
};

/**
 * Step 5 & 6: Registrar final decision (Approve transfer & record in blockchain)
 */
const governmentTransferDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks, rejectionReason } = req.body || {};

    if (!["APPROVE", "REJECT"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be 'APPROVE' or 'REJECT'",
      });
    }

    const transfer = await TransferRequest.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer request not found",
      });
    }

    if (transfer.status !== "GOVERNMENT_REVIEW") {
      return res.status(400).json({
        success: false,
        message: `Government approval requires GOVERNMENT_REVIEW status. Current: '${transfer.status}'`,
      });
    }

    const property = await Property.findById(transfer.property);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Associated property not found",
      });
    }

    if (decision === "APPROVE") {
      const year = new Date().getFullYear();
      const approvalCode = `GOV-APP-TR-${year}-${Math.round(Math.random() * 1e6)}`;

      // 1. Append Block to Simulated Blockchain Ledger
      const block = await appendLedgerRecord({
        propertyId: property._id,
        eventType: "OWNERSHIP_TRANSFERRED",
        previousOwnerId: transfer.seller,
        newOwnerId: transfer.buyer,
        payload: {
          transferRequestId: transfer.transferRequestId,
          propertyCode: property.propertyCode,
          agreedAmount: transfer.agreedAmount,
          transferType: transfer.transferType,
          approvalId: approvalCode,
          registrarId: req.user.userId,
        },
      });

      // 2. Append to OwnershipHistory
      const ownership = await OwnershipHistory.create({
        property: property._id,
        previousOwner: transfer.seller,
        newOwner: transfer.buyer,
        transferRequest: transfer._id,
        transactionType: transfer.transferType,
        transferDate: new Date(),
        transferAmount: transfer.agreedAmount,
        governmentApprovalId: approvalCode,
        blockchainTransactionId: block.transactionId,
        governmentOffice: transfer.governmentOffice,
      });

      // 3. Update Property Current Owner and status
      property.currentOwner = transfer.buyer;
      property.status = "ACTIVE";
      await property.save();

      // 4. Update TransferRequest status
      transfer.status = "COMPLETED";
      transfer.governmentApprovedAt = new Date();
      transfer.remarks = remarks || "Transfer legally approved and recorded on BhoomiChain ledger.";
      await transfer.save();

      // 5. Update PaymentProof status
      await PaymentProof.updateMany(
        { transferRequest: transfer._id },
        { verificationStatus: "VERIFIED" }
      );

      // 6. Audit Log
      await AuditLog.create({
        actor: req.user.userId,
        actorRole: req.user.role || "REGISTRAR",
        action: "PROPERTY_OWNERSHIP_TRANSFERRED",
        entityType: "TransferRequest",
        entityId: String(transfer._id),
        metadata: {
          transferRequestId: transfer.transferRequestId,
          propertyCode: property.propertyCode,
          previousOwner: transfer.seller,
          newOwner: transfer.buyer,
          blockchainTransactionId: block.transactionId,
        },
      });

      return res.json({
        success: true,
        message: "Property ownership transfer successfully completed and recorded in blockchain ledger!",
        transfer,
        newOwner: transfer.buyer,
        ledgerRecord: block,
        ownershipHistory: ownership,
      });
    } else {
      // Rejection
      transfer.status = "REJECTED";
      transfer.rejectionReason = rejectionReason || "Rejected by Sub-Registrar during review.";
      await transfer.save();

      // Restore property status
      property.status = "ACTIVE";
      await property.save();

      await AuditLog.create({
        actor: req.user.userId,
        actorRole: req.user.role || "REGISTRAR",
        action: "TRANSFER_REQUEST_REJECTED",
        entityType: "TransferRequest",
        entityId: String(transfer._id),
        metadata: {
          rejectionReason,
        },
      });

      return res.json({
        success: true,
        message: "Transfer request rejected by registrar.",
        transfer,
      });
    }
  } catch (error) {
    console.error("Government transfer decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process transfer approval decision",
      error: error.message,
    });
  }
};

module.exports = {
  createTransferRequest,
  getMyTransfers,
  getPendingGovernmentTransfers,
  getTransferById,
  sellerVerification,
  buyerVerification,
  securityConfirmation,
  submitPaymentProof,
  governmentTransferDecision,
};
