const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const PropertyDocument = require("../models/PropertyDocument");
const Property = require("../models/Property");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

/**
 * Execute Python document analyzer
 */
const runPythonAnalyzer = (filePath) => {
  return new Promise((resolve, reject) => {
    const analyzerScript = path.resolve(__dirname, "../../../ai-service/analyzer.py");

    execFile("python", [analyzerScript, filePath], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return reject(new Error(stderr || error.message));
      }

      try {
        // Find JSON block in stdout
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return reject(new Error("Failed to parse JSON output from analyzer"));
        }
        const parsed = JSON.parse(jsonMatch[0]);
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`JSON Parse Error: ${parseErr.message}\nOutput: ${stdout}`));
      }
    });
  });
};

/**
 * Analyze document and calculate explainable demo trust score
 */
const analyzeDocument = async (documentId, actor = null) => {
  const document = await PropertyDocument.findById(documentId)
    .populate("property")
    .populate("uploadedBy");

  if (!document) {
    throw new Error("Document not found");
  }

  const property = document.property;
  const owner = document.uploadedBy;

  if (!property) {
    throw new Error("Associated property record not found");
  }

  if (!fs.existsSync(document.filePath)) {
    throw new Error(`Document file not found on server at: ${document.filePath}`);
  }

  // 1. Run text extraction & field detection
  let analysisResult;
  try {
    analysisResult = await runPythonAnalyzer(document.filePath);
  } catch (err) {
    console.error("Python analyzer error:", err.message);
    throw new Error(`Document analysis service failed: ${err.message}`);
  }

  const extracted = analysisResult.extractedData || {};
  const readability = analysisResult.readability || "PASS";

  // 2. Perform explainable consistency checks
  const checks = {
    fileReadability: readability,
    requiredFields: "INCOMPLETE",
    surveyNumber: "MISMATCH",
    area: "MISMATCH",
    ownerName: "MISMATCH",
    location: "MISMATCH",
  };

  let score = 0;

  // A. File readability (up to 15 points)
  if (readability === "PASS") {
    score += 15;
  }

  // B. Required fields detection (up to 15 points)
  const hasBasicFields = extracted.surveyNumber || extracted.area || extracted.ownerName;
  if (hasBasicFields) {
    checks.requiredFields = "DETECTED";
    score += 15;
  }

  // C. Survey Number match check (up to 25 points)
  if (extracted.surveyNumber && property.surveyNumber) {
    const cleanExtractedSurvey = String(extracted.surveyNumber).replace(/[\s\-_]/g, "").toUpperCase();
    const cleanDbSurvey = String(property.surveyNumber).replace(/[\s\-_]/g, "").toUpperCase();

    if (cleanExtractedSurvey === cleanDbSurvey) {
      checks.surveyNumber = "MATCH";
      score += 25;
    } else {
      checks.surveyNumber = "MISMATCH";
    }
  }

  // D. Area match check (up to 20 points)
  if (extracted.area && property.area) {
    const extractedNumMatch = String(extracted.area).match(/[0-9]+(?:\.[0-9]+)?/);
    const extractedAreaVal = extractedNumMatch ? parseFloat(extractedNumMatch[0]) : null;
    const dbAreaVal = parseFloat(property.area);

    if (extractedAreaVal && Math.abs(extractedAreaVal - dbAreaVal) <= 0.05 * dbAreaVal) {
      checks.area = "MATCH";
      score += 20;
    } else {
      checks.area = "MISMATCH";
    }
  }

  // E. Owner Name match check (up to 15 points)
  if (extracted.ownerName && owner && owner.fullName) {
    const cleanExtractedOwner = String(extracted.ownerName).toLowerCase().trim();
    const cleanDbOwner = String(owner.fullName).toLowerCase().trim();

    if (
      cleanExtractedOwner.includes(cleanDbOwner) ||
      cleanDbOwner.includes(cleanExtractedOwner)
    ) {
      checks.ownerName = "MATCH";
      score += 15;
    } else {
      checks.ownerName = "MISMATCH";
    }
  }

  // F. Location / District match check (up to 10 points)
  if (property.district) {
    const dbDistrict = property.district.toLowerCase().trim();
    const extractedDist = (extracted.district || "").toLowerCase().trim();
    const extractedLoc = (extracted.propertyLocation || "").toLowerCase();

    if (
      extractedDist.includes(dbDistrict) ||
      extractedLoc.includes(dbDistrict)
    ) {
      checks.location = "MATCH";
      score += 10;
    } else {
      checks.location = "MISMATCH";
    }
  }

  // Cap score between 0 and 100
  const trustScore = Math.min(Math.max(score, 0), 100);

  // Determine status, risk level and review result
  let aiStatus = "ANALYZED";
  let riskLevel = "LOW";
  let reviewResult = "READY FOR GOVERNMENT REVIEW";

  if (trustScore >= 75 && checks.surveyNumber === "MATCH") {
    aiStatus = "ANALYZED";
    riskLevel = "LOW";
    reviewResult = "READY FOR GOVERNMENT REVIEW";
  } else if (trustScore >= 50) {
    aiStatus = "ANALYZED";
    riskLevel = "MEDIUM";
    reviewResult = "REVIEW WITH CAUTION — MINOR DISCREPANCY DETECTED";
  } else {
    aiStatus = "SUSPICIOUS";
    riskLevel = "HIGH";
    reviewResult = "SUSPICIOUS — MANUAL REVIEW REQUIRED";
  }

  const remarks = `Analysis completed. Trust Score: ${trustScore}%. Survey: ${checks.surveyNumber}, Area: ${checks.area}, Owner: ${checks.ownerName}. Result: ${reviewResult}`;

  // 3. Update database record
  document.extractedData = extracted;
  document.aiStatus = aiStatus;
  document.aiConfidence = trustScore;
  document.remarks = remarks;
  await document.save();

  // 4. Log to AuditLog
  try {
    await AuditLog.create({
      actor: actor?.userId || owner?._id,
      actorRole: actor?.role || "CITIZEN",
      action: "DOCUMENT_ANALYZED",
      entityType: "PropertyDocument",
      entityId: String(document._id),
      metadata: {
        documentType: document.documentType,
        fileName: document.fileName,
        trustScore,
        aiStatus,
        riskLevel,
        checks,
      },
    });
  } catch (auditErr) {
    console.error("Failed to write audit log:", auditErr.message);
  }

  return {
    success: true,
    documentId: document._id,
    fileName: document.fileName,
    documentType: document.documentType,
    checks,
    aiStatus,
    demoTrustScore: trustScore,
    riskLevel,
    reviewResult,
    extractedData: extracted,
    remarks,
  };
};

module.exports = {
  analyzeDocument,
};
