const mongoose = require("mongoose");

const ownershipHistorySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    previousOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    newOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transferRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransferRequest",
    },

    transactionType: {
      type: String,
      enum: ["INITIAL_REGISTRATION", "SALE", "GIFT", "OTHER"],
      required: true,
    },

    transferDate: {
      type: Date,
      default: Date.now,
    },

    transferAmount: Number,

    governmentApprovalId: String,

    blockchainTransactionId: String,

    governmentOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "OwnershipHistory",
  ownershipHistorySchema
);