const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Property = require("../models/Property");
const PropertyDocument = require("../models/PropertyDocument");
const User = require("../models/User");
const TransferRequest = require("../models/TransferRequest");
const OwnershipHistory = require("../models/OwnershipHistory");
const BlockchainRecord = require("../models/BlockchainRecord");
const GovernmentOffice = require("../models/GovernmentOffice");
const AuditLog = require("../models/AuditLog");
const GovLandRecord = require("../models/GovLandRecord");
const { appendLedgerRecord, verifyChainIntegrity } = require("../services/blockchainLedgerService");

/**
 * Registrar / Admin Login
 * Authenticates by GOV ID NUMBER + SECRET PIN + PHONE NUMBER
 */
const loginRegistrar = async (req, res) => {
  try {
    const { govId, secretPin, mobile, bcid } = req.body;
    const identifier = govId || bcid;

    if (!identifier || !secretPin || !mobile) {
      return res.status(400).json({
        success: false,
        message: "GOV ID NUMBER, SECRET PIN, and PHONE NUMBER are required",
      });
    }

    const cleanIdentifier = identifier.trim();
    const cleanPin = secretPin.trim();
    const cleanMobile = mobile.replace(/\D/g, "");

    const registrar = await User.findOne({
      $or: [
        { govId: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
        { bcid: cleanIdentifier.toUpperCase() },
      ],
      role: { $in: ["REGISTRAR", "ADMIN"] },
    });

    if (!registrar) {
      return res.status(401).json({
        success: false,
        message: "No registered Government Officer found with this GOV ID Number",
      });
    }

    // Verify Secret PIN
    if (registrar.secretPin && registrar.secretPin !== cleanPin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Secret PIN for this Government Officer",
      });
    }

    // Verify Phone Number
    const dbMobile = (registrar.mobile || "").replace(/\D/g, "");
    if (dbMobile && !dbMobile.includes(cleanMobile) && !cleanMobile.includes(dbMobile)) {
      return res.status(401).json({
        success: false,
        message: "Registered phone number does not match officer records",
      });
    }

    const token = jwt.sign(
      {
        userId: registrar._id,
        bcid: registrar.bcid,
        role: registrar.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await AuditLog.create({
      actor: registrar._id,
      actorRole: registrar.role,
      action: "REGISTRAR_LOGIN",
      entityType: "User",
      entityId: String(registrar._id),
      metadata: { bcid: registrar.bcid, govId: registrar.govId },
    });

    res.json({
      success: true,
      message: "Registrar authenticated successfully",
      token,
      registrar: {
        id: registrar._id,
        bcid: registrar.bcid,
        govId: registrar.govId || "GOV-MH-2026-001",
        fullName: registrar.fullName,
        mobile: registrar.mobile,
        role: registrar.role,
        secretPin: registrar.secretPin || "9801",
      },
    });
  } catch (error) {
    console.error("Registrar login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Overview statistics for Government Registrar Dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCitizens,
      verifiedProperties,
      pendingVerifications,
      pendingTransfers,
      completedTransfers,
      blockchainRecords,
    ] = await Promise.all([
      User.countDocuments({ role: "CITIZEN" }),
      Property.countDocuments({ verificationStatus: "VERIFIED" }),
      Property.countDocuments({
        verificationStatus: { $in: ["PENDING", "UNDER_REVIEW"] },
      }),
      TransferRequest.countDocuments({
        status: {
          $in: [
            "REQUESTED",
            "SELLER_VERIFICATION_PENDING",
            "BUYER_VERIFICATION_PENDING",
            "PAYMENT_PENDING",
            "PAYMENT_SUBMITTED",
            "GOVERNMENT_REVIEW",
          ],
        },
      }),
      TransferRequest.countDocuments({ status: "COMPLETED" }),
      BlockchainRecord.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        totalCitizens,
        verifiedProperties,
        pendingVerifications,
        pendingTransfers,
        completedTransfers,
        blockchainRecords,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Fetch all properties pending registrar review
 */
const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      verificationStatus: { $in: ["PENDING", "UNDER_REVIEW"] },
    })
      .populate("currentOwner", "fullName bcid mobile identityVerificationStatus")
      .sort({ createdAt: -1 });

    // Attach documents and analysis summaries for each property
    const propertiesWithDocs = await Promise.all(
      properties.map(async (p) => {
        const docs = await PropertyDocument.find({ property: p._id }).select(
          "documentType fileName aiStatus aiConfidence governmentStatus remarks createdAt"
        );
        return {
          ...p.toObject(),
          documents: docs,
          documentsCount: docs.length,
        };
      })
    );

    res.json({
      success: true,
      count: propertiesWithDocs.length,
      properties: propertiesWithDocs,
    });
  } catch (error) {
    console.error("Get pending properties error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending properties",
      error: error.message,
    });
  }
};

/**
 * Get detailed property review data including all documents and AI analysis
 */
const getPropertyReviewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property id format",
      });
    }

    const property = await Property.findById(id).populate(
      "currentOwner",
      "fullName bcid mobile address dob identityVerificationStatus"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const documents = await PropertyDocument.find({ property: id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      property,
      documents,
    });
  } catch (error) {
    console.error("Property review details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property details for review",
      error: error.message,
    });
  }
};

/**
 * Registrar decision: Approve or Reject a property registration request
 */
const verifyPropertyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason, remarks } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property id format",
      });
    }

    if (!["APPROVE", "REJECT"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "decision must be either 'APPROVE' or 'REJECT'",
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.verificationStatus === "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Property is already verified and recorded",
      });
    }

    const office = await GovernmentOffice.findOne({ status: "ACTIVE" });

    if (decision === "APPROVE") {
      // 1. Update property status
      property.verificationStatus = "VERIFIED";
      property.status = "ACTIVE";
      await property.save();

      // 2. Generate Government Approval Reference
      const year = new Date().getFullYear();
      const approvalCode = `GOV-APP-${year}-${Math.round(Math.random() * 1e6)}`;

      // 3. Append to Simulated Blockchain Ledger
      const block = await appendLedgerRecord({
        propertyId: property._id,
        eventType: "PROPERTY_REGISTERED",
        previousOwnerId: null,
        newOwnerId: property.currentOwner,
        payload: {
          propertyCode: property.propertyCode,
          surveyNumber: property.surveyNumber,
          area: property.area,
          district: property.district,
          state: property.state,
          approvalId: approvalCode,
          registrarId: req.user.userId,
        },
      });

      // 4. Create Initial Ownership History Record
      const ownership = await OwnershipHistory.create({
        property: property._id,
        newOwner: property.currentOwner,
        transactionType: "INITIAL_REGISTRATION",
        transferDate: new Date(),
        governmentApprovalId: approvalCode,
        blockchainTransactionId: block.transactionId,
        governmentOffice: office?._id,
      });

      // 5. Update associated documents to VERIFIED
      await PropertyDocument.updateMany(
        { property: property._id },
        { governmentStatus: "VERIFIED" }
      );

      // 6. Log Audit Action
      await AuditLog.create({
        actor: req.user.userId,
        actorRole: req.user.role || "REGISTRAR",
        action: "PROPERTY_VERIFIED_AND_APPROVED",
        entityType: "Property",
        entityId: String(property._id),
        metadata: {
          propertyCode: property.propertyCode,
          blockchainTransactionId: block.transactionId,
          approvalCode,
          remarks,
        },
      });

      return res.json({
        success: true,
        message: "Property successfully approved and recorded in blockchain ledger",
        property,
        ledgerRecord: block,
        ownershipHistory: ownership,
      });
    } else {
      // Rejection branch
      property.verificationStatus = "REJECTED";
      await property.save();

      await PropertyDocument.updateMany(
        { property: property._id },
        { governmentStatus: "REJECTED" }
      );

      await AuditLog.create({
        actor: req.user.userId,
        actorRole: req.user.role || "REGISTRAR",
        action: "PROPERTY_REGISTRATION_REJECTED",
        entityType: "Property",
        entityId: String(property._id),
        metadata: {
          propertyCode: property.propertyCode,
          rejectionReason,
          remarks,
        },
      });

      return res.json({
        success: true,
        message: "Property registration rejected",
        property,
        rejectionReason,
      });
    }
  } catch (error) {
    console.error("Verify property error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify property registration",
      error: error.message,
    });
  }
};

/**
 * Fetch simulated blockchain ledger records
 */
const getLedger = async (req, res) => {
  try {
    const records = await BlockchainRecord.find()
      .populate("property", "propertyCode surveyNumber propertyType district")
      .populate("previousOwner", "fullName bcid")
      .populate("newOwner", "fullName bcid")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get ledger error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blockchain ledger records",
      error: error.message,
    });
  }
};

/**
 * Recalculate all hashes and verify blockchain ledger integrity
 */
const verifyLedger = async (req, res) => {
  try {
    const verification = await verifyChainIntegrity();
    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error("Ledger verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify ledger integrity",
      error: error.message,
    });
  }
};

/**
 * Get Government Audit Logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "fullName bcid role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Audit log error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};


/**
 * Get ALL transfers (all statuses) for Registrar overview
 */
const getAllTransfers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const transfers = await TransferRequest.find(filter)
      .populate("property", "propertyCode surveyNumber propertyType district area areaUnit")
      .populate("seller", "fullName bcid mobile")
      .populate("buyer", "fullName bcid mobile")
      .populate("registrar", "fullName bcid")
      .populate("governmentOffice", "officeName officeCode")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error("Get all transfers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfers",
      error: error.message,
    });
  }
};

/**
 * Get ALL properties for Registrar overview (all statuses)
 */
const getAllProperties = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};

    const properties = await Property.find(filter)
      .populate("currentOwner", "fullName bcid mobile identityVerificationStatus")
      .sort({ createdAt: -1 });

    const propertiesWithDocs = await Promise.all(
      properties.map(async (p) => {
        const docs = await PropertyDocument.find({ property: p._id }).select(
          "documentType fileName aiStatus aiConfidence governmentStatus createdAt"
        );
        return { ...p.toObject(), documents: docs, documentsCount: docs.length };
      })
    );

    res.json({
      success: true,
      count: propertiesWithDocs.length,
      properties: propertiesWithDocs,
    });
  } catch (error) {
    console.error("Get all properties error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

/**
 * Look up citizen by BCID (for Gov Transfer Form autocomplete)
 * Returns fullName, aadhaarNumber, mobile, etc.
 */
const lookupCitizen = async (req, res) => {
  try {
    const { bcid } = req.params;
    if (!bcid) {
      return res.status(400).json({ success: false, message: "BCID parameter is required" });
    }

    const cleanBcid = bcid.trim().toUpperCase();
    const citizen = await User.findOne({ bcid: cleanBcid }).select(
      "fullName bcid aadhaarNumber mobile email address"
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: `Citizen with ID '${cleanBcid}' not found`,
      });
    }

    res.json({
      success: true,
      citizen,
    });
  } catch (error) {
    console.error("Lookup citizen error:", error);
    res.status(500).json({ success: false, message: "Failed to look up citizen", error: error.message });
  }
};

/**
 * Get verified properties owned by a citizen BCID (for Gov Transfer Form dropdown)
 */
const getCitizenProperties = async (req, res) => {
  try {
    const { bcid } = req.params;
    if (!bcid) {
      return res.status(400).json({ success: false, message: "BCID parameter is required" });
    }

    const cleanBcid = bcid.trim().toUpperCase();
    const citizen = await User.findOne({ bcid: cleanBcid });
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: `Citizen with ID '${cleanBcid}' not found`,
      });
    }

    const properties = await Property.find({
      currentOwner: citizen._id,
      verificationStatus: "VERIFIED",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        bcid: citizen.bcid,
        aadhaarNumber: citizen.aadhaarNumber,
        mobile: citizen.mobile,
      },
      properties,
    });
  } catch (error) {
    console.error("Get citizen properties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch citizen properties", error: error.message });
  }
};

/**
 * Get Master Government Land Records (100 records)
 * Supports search, filter (REGISTERED / UNREGISTERED / ALL), and pagination
 */
const getMasterRecords = async (req, res) => {
  try {
    const { search, status, district, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status === "REGISTERED") {
      query.isRegisteredOnBhoomiChain = true;
    } else if (status === "UNREGISTERED") {
      query.isRegisteredOnBhoomiChain = false;
    }

    if (district) {
      query.district = district;
    }

    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, "i");
      query.$or = [
        { surveyNumber: regex },
        { gatNumber: regex },
        { ownerName: regex },
        { propertyCode: regex },
        { district: regex },
        { taluka: regex },
        { village: regex },
        { ownerAadhaar: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await GovLandRecord.countDocuments(query);
    const records = await GovLandRecord.find(query)
      .sort({ createdAt: -1, surveyNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalRegistered = await GovLandRecord.countDocuments({ isRegisteredOnBhoomiChain: true });
    const totalUnregistered = await GovLandRecord.countDocuments({ isRegisteredOnBhoomiChain: false });

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalRegistered,
      totalUnregistered,
      records,
    });
  } catch (error) {
    console.error("Get master records error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch master government records", error: error.message });
  }
};

/**
 * Cross-Check property and applicant against Master Land Database
 * Matches surveyNumber and ownerName in official government land registry
 */
const checkMasterDatabase = async (req, res) => {
  try {
    const { surveyNumber, ownerName, propertyId } = req.body;

    if (!surveyNumber) {
      return res.status(400).json({
        success: false,
        message: "Survey number is required for verification",
      });
    }

    const cleanSurvey = surveyNumber.trim();
    const record = await GovLandRecord.findOne({
      $or: [
        { surveyNumber: cleanSurvey },
        { surveyNumber: { $regex: new RegExp(`^${cleanSurvey}$`, "i") } },
      ],
    });

    if (!record) {
      return res.json({
        success: true,
        result: {
          found: false,
          surveyMatch: false,
          ownerMatch: false,
          confidence: "NOT_FOUND",
          message: `Survey Number '${cleanSurvey}' was NOT found in the State Revenue & Land Records database. This parcel may require physical surveyor inspection.`,
          officialRecord: null,
        },
      });
    }

    let ownerMatch = false;
    let confidence = "PARTIAL_MATCH";
    let message = "";

    if (ownerName && ownerName.trim()) {
      const inputOwner = ownerName.trim().toLowerCase();
      const recOwner = record.ownerName.trim().toLowerCase();
      
      const inputTokens = inputOwner.split(/\s+/).filter(Boolean);
      const recTokens = recOwner.split(/\s+/).filter(Boolean);
      const hasTokenOverlap = inputTokens.some(t => recTokens.includes(t));

      if (inputOwner === recOwner || recOwner.includes(inputOwner) || inputOwner.includes(recOwner)) {
        ownerMatch = true;
        confidence = "EXACT_MATCH";
        message = `✅ Verified Official Match: Survey No. ${record.surveyNumber} is legally registered under '${record.ownerName}' in the Maharashtra Land Registry (Gat #${record.gatNumber || "N/A"}, ${record.district}).`;
      } else if (hasTokenOverlap) {
        ownerMatch = true;
        confidence = "PARTIAL_MATCH";
        message = `⚠️ Name Variation Match: Official land record owner is '${record.ownerName}', applicant provided '${ownerName}'. Survey No. ${record.surveyNumber} exists.`;
      } else {
        ownerMatch = false;
        confidence = "OWNER_MISMATCH";
        message = `❌ Title Conflict: Survey No. ${record.surveyNumber} exists in government database, but is officially owned by '${record.ownerName}', NOT by applicant '${ownerName}'.`;
      }
    } else {
      confidence = "SURVEY_FOUND";
      message = `Survey No. ${record.surveyNumber} found in Government Registry under owner '${record.ownerName}'.`;
    }

    res.json({
      success: true,
      result: {
        found: true,
        surveyMatch: true,
        ownerMatch,
        confidence,
        message,
        officialRecord: record,
      },
    });
  } catch (error) {
    console.error("Check master database error:", error);
    res.status(500).json({ success: false, message: "Database verification check failed", error: error.message });
  }
};

module.exports = {
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
};
