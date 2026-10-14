const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    actorRole: {
      type: String,
      enum: ["CITIZEN", "REGISTRAR", "ADMIN", "SYSTEM"],
    },

    action: {
      type: String,
      required: true,
    },

    entityType: String,

    entityId: String,

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);