const mongoose = require("mongoose");

const transferRequestSchema = new mongoose.Schema(
  {
    transferRequestId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    governmentOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
    },

    agreedAmount: {
      type: Number,
      required: true,
    },

    transferType: {
      type: String,
      enum: ["SALE", "GIFT", "OTHER"],
      default: "SALE",
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "SELLER_ACCEPTANCE_PENDING",
        "SELLER_VERIFICATION_PENDING",
        "SELLER_VERIFIED",
        "BUYER_ACCEPTANCE_PENDING",
        "BUYER_VERIFICATION_PENDING",
        "BUYER_VERIFIED",
        "SECURITY_CONFIRMATION_PENDING",
        "PAYMENT_PENDING",
        "PAYMENT_SUBMITTED",
        "PAYMENT_VERIFIED",
        "GOVERNMENT_REVIEW",
        "APPROVED",
        "REJECTED",
        "BLOCKCHAIN_RECORDED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SELLER_ACCEPTANCE_PENDING",
    },

    sellerAcceptedAt: Date,
    buyerAcceptedAt: Date,

    sellerSecurityConfirmed: {
      type: Boolean,
      default: false,
    },
    sellerSecurityConfirmedAt: Date,
    sellerConfirmationData: {
      bcid: String,
      aadhaarNumber: String,
      secretCardCode: String,
      cardPin: String,
      phone: String,
    },

    buyerSecurityConfirmed: {
      type: Boolean,
      default: false,
    },
    buyerSecurityConfirmedAt: Date,
    buyerConfirmationData: {
      bcid: String,
      aadhaarNumber: String,
      secretCardCode: String,
      cardPin: String,
      phone: String,
    },

    paymentDetails: {
      paymentMode: {
        type: String,
        enum: ["BANK_TRANSFER", "UPI", "CHEQUE_DD"],
      },
      referenceNumber: String,
      bankName: String,
      amount: Number,
      paymentDate: Date,
      notes: String,
    },

    sellerVerifiedAt: Date,
    buyerVerifiedAt: Date,
    paymentSubmittedAt: Date,
    paymentVerifiedAt: Date,
    governmentApprovedAt: Date,

    rejectionReason: String,
    remarks: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TransferRequest",
  transferRequestSchema
);