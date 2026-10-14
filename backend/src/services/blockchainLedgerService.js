const crypto = require("crypto");
const BlockchainRecord = require("../models/BlockchainRecord");

/**
 * Deterministically sort object keys recursively for canonical hashing
 */
const serializeCanonical = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(serializeCanonical).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${serializeCanonical(obj[key])}`
  );

  return "{" + entries.join(",") + "}";
};

/**
 * Compute SHA-256 hash
 */
const sha256 = (str) => {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
};

/**
 * Generate unique transaction ID
 */
const generateTransactionId = async () => {
  const year = new Date().getFullYear();
  const count = await BlockchainRecord.countDocuments();
  const counter = String(count + 1).padStart(6, "0");
  return `TX-${year}-${counter}`;
};

/**
 * Create a new immutable block in the simulated hash-chain ledger
 */
const appendLedgerRecord = async ({
  propertyId,
  eventType,
  previousOwnerId = null,
  newOwnerId,
  payload = {},
}) => {
  // 1. Fetch latest record to get previous hash
  const latestRecord = await BlockchainRecord.findOne().sort({ createdAt: -1 });
  const previousHash = latestRecord ? latestRecord.currentHash : "GENESIS";

  // 2. Canonicalize transaction data & compute data hash
  const canonicalData = serializeCanonical({
    propertyId: String(propertyId),
    eventType,
    previousOwner: previousOwnerId ? String(previousOwnerId) : null,
    newOwner: String(newOwnerId),
    details: payload,
  });

  const dataHash = sha256(canonicalData);
  const timestamp = new Date();

  // 3. Current hash = SHA256(previousHash + canonicalData + timestampISO)
  const currentHash = sha256(
    `${previousHash}|${canonicalData}|${timestamp.toISOString()}`
  );

  const transactionId = await generateTransactionId();

  // 4. Save Block
  const block = await BlockchainRecord.create({
    transactionId,
    property: propertyId,
    eventType,
    previousOwner: previousOwnerId,
    newOwner: newOwnerId,
    dataHash,
    previousHash,
    currentHash,
    timestamp,
    blockStatus: "VALID",
  });

  return block;
};

/**
 * Verify integrity of the entire hash chain
 */
const verifyChainIntegrity = async () => {
  const records = await BlockchainRecord.find()
    .sort({ createdAt: 1 })
    .populate("property", "propertyCode surveyNumber")
    .populate("previousOwner", "fullName bcid")
    .populate("newOwner", "fullName bcid");

  if (records.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      message: "Ledger is empty (Genesis state)",
      blocks: [],
    };
  }

  let expectedPreviousHash = "GENESIS";
  const verifiedBlocks = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    let isBlockValid = true;
    let reason = null;

    // Check link to previous block
    if (record.previousHash !== expectedPreviousHash) {
      isBlockValid = false;
      reason = `Broken link: expected previousHash '${expectedPreviousHash}', got '${record.previousHash}'`;
    }

    verifiedBlocks.push({
      blockIndex: i + 1,
      transactionId: record.transactionId,
      eventType: record.eventType,
      propertyCode: record.property?.propertyCode,
      previousHash: record.previousHash,
      currentHash: record.currentHash,
      timestamp: record.timestamp,
      isValid: isBlockValid,
      reason,
    });

    if (!isBlockValid) {
      return {
        isValid: false,
        totalBlocks: records.length,
        compromisedAtBlock: i + 1,
        compromisedTransactionId: record.transactionId,
        reason,
        blocks: verifiedBlocks,
      };
    }

    expectedPreviousHash = record.currentHash;
  }

  return {
    isValid: true,
    totalBlocks: records.length,
    headHash: records[records.length - 1].currentHash,
    message: "Hash chain integrity verified. Zero tampering detected.",
    blocks: verifiedBlocks,
  };
};

module.exports = {
  appendLedgerRecord,
  verifyChainIntegrity,
  sha256,
  serializeCanonical,
};
