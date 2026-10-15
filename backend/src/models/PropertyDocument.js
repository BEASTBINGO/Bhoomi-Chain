const mongoose = require("mongoose");

const propertyDocumentSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documentType: {
      type: String,
      enum: [
        "SALE_DEED",
        "7_12_EXTRACT",
        "PROPERTY_CARD",
        "REGISTRATION_DOCUMENT",
        "TAX_RECEIPT",
        "IDENTITY_PROOF",
        "ADDRESS_PROOF",
        "OTHER",
      ],
      required: true,
    },

    fileName: String,
    filePath: String,

    extractedData: {
      ownerName: String,
      surveyNumber: String,
      propertyLocation: String,
      village: String,
      taluka: String,
      district: String,
      area: String,
      registrationNumber: String,
      documentDate: String,
      previousOwner: String,
    },

    aiStatus: {
      type: String,
      enum: ["PENDING", "ANALYZED", "SUSPICIOUS", "VERIFIED"],
      default: "PENDING",
    },

    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },

    readabilityStatus: {
      type: String,
      enum: ["PASS", "FAIL", "WARNING"],
      default: "PASS",
    },

    readabilityScore: {
      type: Number,
      default: 98,
    },

    formatValid: {
      type: Boolean,
      default: true,
    },

    fileHash: String,
    fileSize: Number,
    mimeType: String,

    governmentStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PropertyDocument",
  propertyDocumentSchema
);