require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/User");
const GovernmentOffice = require("../src/models/GovernmentOffice");

async function seed() {
  console.log("Seeding BhoomiChain Government & Registrar Accounts...");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // 1. Seed Government Office
  let office = await GovernmentOffice.findOne({ officeCode: "SRO-MH-PLG-001" });
  if (!office) {
    office = await GovernmentOffice.create({
      officeId: "GOV-OFFICE-001",
      officeName: "Sub-Registrar Office, Vasai-Virar (Palghar Division)",
      officeCode: "SRO-MH-PLG-001",
      district: "Palghar",
      taluka: "Vasai",
      state: "Maharashtra",
      address: "Administrative Complex, Station Road, Virar West, Palghar - 401303",
      status: "ACTIVE",
    });
    console.log("[OK] Seeded Government Office:", office.officeName);
  } else {
    console.log("[EXISTS] Government Office:", office.officeName);
  }

  // 2. Seed Prototype Registrar
  let registrar = await User.findOne({ mobile: "9800000001" });
  if (!registrar) {
    registrar = await User.create({
      bcid: "BCID-REG-2026-000001",
      fullName: "Shri Anant Deshmukh (Sub-Registrar)",
      mobile: "9800000001",
      role: "REGISTRAR",
      identityVerificationStatus: "VERIFIED",
      address: "Virar Sub-Registrar Office, Palghar",
    });
    console.log("[OK] Seeded Registrar Account:", registrar.fullName, `(${registrar.bcid})`);
  } else {
    console.log("[EXISTS] Registrar Account:", registrar.fullName);
  }

  // 3. Seed Prototype Admin
  let admin = await User.findOne({ mobile: "9800000000" });
  if (!admin) {
    admin = await User.create({
      bcid: "BCID-ADM-2026-000001",
      fullName: "Chief Land Records Administrator",
      mobile: "9800000000",
      role: "ADMIN",
      identityVerificationStatus: "VERIFIED",
      address: "State Land Governance Directorate, Mumbai",
    });
    console.log("[OK] Seeded Admin Account:", admin.fullName, `(${admin.bcid})`);
  } else {
    console.log("[EXISTS] Admin Account:", admin.fullName);
  }

  await mongoose.disconnect();
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
