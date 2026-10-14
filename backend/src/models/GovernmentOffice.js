const mongoose = require("mongoose");

const governmentOfficeSchema = new mongoose.Schema(
  {
    officeId: {
      type: String,
      unique: true,
      required: true,
    },

    officeName: {
      type: String,
      required: true,
    },

    state: String,
    district: String,
    taluka: String,

    officeCode: {
      type: String,
      unique: true,
    },

    address: String,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GovernmentOffice",
  governmentOfficeSchema
);