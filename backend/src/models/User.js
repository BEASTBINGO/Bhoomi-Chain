const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    bcid: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
    },

    fatherName: {
      type: String,
      trim: true,
    },

    motherName: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE",
    },

    aadhaarNumber: {
      type: String,
      trim: true,
    },

    panNumber: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
      default: "Maharashtra",
    },

    district: {
      type: String,
      trim: true,
    },

    taluka: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    occupation: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    secretPin: {
      type: String,
      default: "1234",
    },

    govId: {
      type: String,
      trim: true,
    },

    cardExpiryDate: {
      type: String,
      default: "12/30",
    },

    secretCardCode: {
      type: String,
      default: "789",
    },

    role: {
      type: String,
      enum: ["CITIZEN", "REGISTRAR", "ADMIN"],
      default: "CITIZEN",
    },

    identityVerificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);