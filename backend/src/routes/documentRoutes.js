const express = require("express");
const multer = require("multer");

const {
  uploadDocument,
  getDocumentsByProperty,
  getDocumentById,
  analyzePropertyDocument,
} = require("../controllers/documentController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Middleware to gracefully handle Multer upload errors with clear, actionable messages
const handleUpload = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: `Unexpected file field '${err.field}'. In Postman form-data, the file key must be named exactly 'document'.`,
        });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds the 10 MB limit.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

router.post("/upload", protect, handleUpload, uploadDocument);
router.get("/property/:propertyId", protect, getDocumentsByProperty);
router.get("/:id", protect, getDocumentById);
router.post("/:id/analyze", protect, analyzePropertyDocument);

module.exports = router;