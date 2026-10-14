const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    propertyCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    surveyNumber: {
      type: String,
      required: true,
    },

    propertyType: {
      type: String,
      enum: [
        "RESIDENTIAL_LAND",
        "AGRICULTURAL_LAND",
        "COMMERCIAL_PROPERTY",
        "RESIDENTIAL_PROPERTY",
        "OTHER",
      ],
      required: true,
    },

    address: String,
    village: String,
    taluka: String,
    district: String,
    state: String,
    pincode: String,

    area: Number,

    areaUnit: {
      type: String,
      default: "sq.ft",
    },

    description: String,

    verificationStatus: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "TRANSFER_PENDING", "INACTIVE"],
      default: "ACTIVE",
    },

    latitude: Number,
    longitude: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);