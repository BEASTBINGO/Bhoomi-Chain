const mongoose = require("mongoose");

const blockchainRecordSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    eventType: {
      type: String,
      enum: [
        "PROPERTY_REGISTERED",
        "OWNERSHIP_TRANSFERRED",
        "DOCUMENT_VERIFIED",
      ],
      required: true,
    },

    previousOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    newOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    dataHash: {
      type: String,
      required: true,
    },

    previousHash: {
      type: String,
      default: "GENESIS",
    },

    currentHash: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    blockStatus: {
      type: String,
      enum: ["VALID", "INVALID"],
      default: "VALID",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BlockchainRecord",
  blockchainRecordSchema
);