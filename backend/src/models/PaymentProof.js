const mongoose = require("mongoose");

const paymentProofSchema = new mongoose.Schema(
  {
    transferRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransferRequest",
      required: true,
    },

    paymentReference: {
      type: String,
      required: true,
    },

    paymentMode: {
      type: String,
      enum: [
        "UPI",
        "NET_BANKING",
        "DEBIT_CARD",
        "CREDIT_CARD",
        "NEFT",
        "RTGS",
        "OTHER",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentDate: Date,

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    verificationSource: {
      type: String,
      default: "DEMO_VALIDATION",
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentProof", paymentProofSchema);