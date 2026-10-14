const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateBCID = async () => {
  const year = new Date().getFullYear();

  const count = await User.countDocuments({
    role: "CITIZEN",
  });

  const number = String(count + 1).padStart(6, "0");

  return `BCID-IND-${year}-${number}`;
};

const AuditLog = require("../models/AuditLog");

const registerCitizen = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      fatherName,
      motherName,
      address,
      state,
      district,
      taluka,
      pincode,
      mobile,
      email,
      aadhaarNumber,
      panNumber,
      occupation,
    } = req.body;

    if (!fullName || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Full legal name and registered mobile number are required",
      });
    }

    const cleanMobile = String(mobile).trim();
    const existingCitizen = await User.findOne({ mobile: cleanMobile });

    if (existingCitizen) {
      return res.status(409).json({
        success: false,
        message: `Citizen with mobile number '${cleanMobile}' already exists in registry (BCID: ${existingCitizen.bcid})`,
      });
    }

    const bcid = await generateBCID();

    const citizen = await User.create({
      bcid,
      fullName: fullName.trim(),
      dob: dob ? new Date(dob) : undefined,
      gender: gender || "MALE",
      fatherName: fatherName ? fatherName.trim() : "",
      motherName: motherName ? motherName.trim() : "",
      address: address ? address.trim() : "",
      state: state || "Maharashtra",
      district: district ? district.trim() : "",
      taluka: taluka ? taluka.trim() : "",
      pincode: pincode ? pincode.trim() : "",
      mobile: cleanMobile,
      email: email ? email.trim() : "",
      aadhaarNumber: aadhaarNumber ? aadhaarNumber.trim() : "5489 3210 9999",
      panNumber: panNumber ? panNumber.trim().toUpperCase() : "",
      occupation: occupation ? occupation.trim() : "",
      secretPin: req.body.secretPin ? String(req.body.secretPin).trim() : "1234",
      cardExpiryDate: req.body.cardExpiryDate ? String(req.body.cardExpiryDate).trim() : "12/30",
      secretCardCode: req.body.secretCardCode ? String(req.body.secretCardCode).trim() : String(Math.floor(100 + Math.random() * 900)),
      role: "CITIZEN",
      identityVerificationStatus: "VERIFIED",
    });

    // Issue JWT token so new citizen is immediately authenticated
    const token = jwt.sign(
      {
        userId: citizen._id,
        bcid: citizen.bcid,
        role: citizen.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "4h",
      }
    );

    // Record system audit log
    await AuditLog.create({
      actor: citizen._id,
      actorRole: "CITIZEN",
      action: "CITIZEN_ENROLLED",
      entityType: "User",
      entityId: citizen._id.toString(),
      metadata: {
        bcid: citizen.bcid,
        fullName: citizen.fullName,
        mobile: citizen.mobile,
        district: citizen.district,
        aadhaarMasked: citizen.aadhaarNumber ? `XXXX-XXXX-${citizen.aadhaarNumber.slice(-4)}` : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Citizen enrolled successfully. BCID digital identity issued.",
      token,
      citizen: {
        id: citizen._id,
        bcid: citizen.bcid,
        fullName: citizen.fullName,
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNumber: citizen.aadhaarNumber,
        cardExpiryDate: citizen.cardExpiryDate,
        secretCardCode: citizen.secretCardCode,
        secretPin: citizen.secretPin,
        address: citizen.address,
        district: citizen.district,
        taluka: citizen.taluka,
        state: citizen.state,
        pincode: citizen.pincode,
        identityVerificationStatus: citizen.identityVerificationStatus,
        createdAt: citizen.createdAt,
      },
    });
  } catch (error) {
    console.error("Citizen registration error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to complete citizen registration",
    });
  }
};

const loginCitizen = async (req, res) => {
  try {
    const { bcid, mobile, secretPin, aadhaarNumber, cardExpiryDate } = req.body;

    if (!bcid || !mobile) {
      return res.status(400).json({
        success: false,
        message: "BCID (BID) and Contact mobile number are required",
      });
    }

    const cleanBcid = bcid.trim();
    const cleanMobile = mobile.trim();

    const citizen = await User.findOne({
      bcid: { $regex: new RegExp(`^${cleanBcid}$`, "i") },
      mobile: cleanMobile,
      role: "CITIZEN",
    });

    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: "Invalid BID code or registered contact number",
      });
    }

    // Verify Secret PIN if provided
    if (secretPin && citizen.secretPin && citizen.secretPin !== String(secretPin).trim()) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Secret PIN entered",
      });
    }

    // Verify Aadhaar Card Number if provided
    if (aadhaarNumber && citizen.aadhaarNumber) {
      const cleanInputAadhaar = String(aadhaarNumber).replace(/[\s-]/g, "");
      const cleanDbAadhaar = String(citizen.aadhaarNumber).replace(/[\s-]/g, "");
      if (cleanInputAadhaar !== cleanDbAadhaar) {
        return res.status(401).json({
          success: false,
          message: "Aadhaar Card Number does not match registered card records",
        });
      }
    }

    // Verify Expiry Date if provided
    if (cardExpiryDate && citizen.cardExpiryDate) {
      const cleanInputExp = String(cardExpiryDate).trim();
      const cleanDbExp = String(citizen.cardExpiryDate).trim();
      if (cleanInputExp !== cleanDbExp) {
        return res.status(401).json({
          success: false,
          message: `Card expiry date does not match (Expected format: ${cleanDbExp})`,
        });
      }
    }

    const token = jwt.sign(
      {
        userId: citizen._id,
        bcid: citizen.bcid,
        role: citizen.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "4h",
      }
    );

    res.json({
      success: true,
      message: "Citizen identity verified successfully",
      token,
      citizen: {
        id: citizen._id,
        bcid: citizen.bcid,
        fullName: citizen.fullName,
        mobile: citizen.mobile,
        email: citizen.email,
        aadhaarNumber: citizen.aadhaarNumber || "5489 3210 1001",
        cardExpiryDate: citizen.cardExpiryDate || "12/30",
        secretCardCode: citizen.secretCardCode || "789",
        secretPin: citizen.secretPin || "1234",
        address: citizen.address,
        district: citizen.district,
        taluka: citizen.taluka,
        state: citizen.state,
        pincode: citizen.pincode,
        identityVerificationStatus: citizen.identityVerificationStatus,
        createdAt: citizen.createdAt,
      },
    });
  } catch (error) {
    console.error("Citizen login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

const getCitizenProfile = async (req, res) => {
  try {
    const citizen = await User.findById(req.user.userId).select(
      "-__v"
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    res.json({
      success: true,
      citizen,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch citizen profile",
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  getCitizenProfile,
};