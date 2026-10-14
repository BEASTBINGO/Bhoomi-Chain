const mongoose = require("mongoose");

const govLandRecordSchema = new mongoose.Schema(
  {
    surveyNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    gatNumber: {
      type: String,
      trim: true,
    },

    propertyCode: {
      type: String,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    ownerAadhaar: {
      type: String,
      trim: true,
    },

    ownerPhone: {
      type: String,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: [
        "RESIDENTIAL_LAND",
        "AGRICULTURAL_LAND",
        "COMMERCIAL_LAND",
        "INDUSTRIAL_LAND",
      ],
      default: "RESIDENTIAL_LAND",
    },

    area: {
      type: Number,
      required: true,
    },

    areaUnit: {
      type: String,
      default: "sq.ft",
    },

    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    taluka: {
      type: String,
      trim: true,
    },

    village: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    marketValue: {
      type: Number,
      default: 2500000,
    },

    isRegisteredOnBhoomiChain: {
      type: Boolean,
      default: false,
      index: true,
    },

    bhoomiChainPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },

    landStatus: {
      type: String,
      enum: ["CLEAN_TITLE", "DISPUTED", "MORTGAGED", "GOVERNMENT_LEASE"],
      default: "CLEAN_TITLE",
    },

    taxClearanceStatus: {
      type: String,
      enum: ["PAID", "PENDING_CLEARANCE"],
      default: "PAID",
    },

    lastRevenueAssessmentYear: {
      type: Number,
      default: 2024,
    },

    governmentSealNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search text index for fast master database lookups
govLandRecordSchema.index({
  surveyNumber: "text",
  ownerName: "text",
  district: "text",
  village: "text",
});

module.exports = mongoose.model("GovLandRecord", govLandRecordSchema);
