require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const documentRoutes = require("./routes/documentRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const governmentRoutes = require("./routes/governmentRoutes");
const transferRoutes = require("./routes/transferRoutes");

const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/citizens", citizenRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/government", governmentRoutes);
app.use("/api/transfers", transferRoutes);

app.get("/", (req, res) => {
  res.json({
    project: "BhoomiChain",
    message: "BhoomiChain API is running",
  });
});

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`BhoomiChain API running on port ${PORT}`);
  });
};

startServer();