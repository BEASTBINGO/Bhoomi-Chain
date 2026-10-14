require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function updateUsers() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhoomichain');
  console.log('Connected to MongoDB');

  // Update Registrar
  await User.updateOne(
    { bcid: 'BCID-REG-2026-000001' },
    {
      $set: {
        govId: 'GOV-MH-2026-001',
        secretPin: '9801',
        mobile: '9800000001',
        role: 'REGISTRAR',
        identityVerificationStatus: 'VERIFIED',
      },
    }
  );

  // Update Mehul Kasrung
  await User.updateOne(
    { bcid: 'BCID-IND-2026-000001' },
    {
      $set: {
        secretPin: '1234',
        aadhaarNumber: '5489 3210 1001',
        cardExpiryDate: '12/30',
        secretCardCode: '789',
        address: '102, Shanti Sadan, Station Road, Virar West, Palghar, Maharashtra - 401303',
        district: 'Palghar',
        taluka: 'Vasai',
        identityVerificationStatus: 'VERIFIED',
      },
    }
  );

  // Update Pooja Sharma
  await User.updateOne(
    { bcid: 'BCID-IND-2026-000002' },
    {
      $set: {
        secretPin: '1234',
        aadhaarNumber: '5489 3210 1002',
        cardExpiryDate: '12/30',
        secretCardCode: '456',
        address: 'B-404, Sea Green Towers, Andheri West, Mumbai Suburban, Maharashtra - 400053',
        district: 'Mumbai Suburban',
        taluka: 'Andheri',
        identityVerificationStatus: 'VERIFIED',
      },
    }
  );

  // Update Vikram Patil if exists
  await User.updateOne(
    { bcid: 'BCID-IND-2026-000003' },
    {
      $set: {
        secretPin: '1234',
        cardExpiryDate: '12/30',
        secretCardCode: '321',
      },
    }
  );

  console.log('✅ Users successfully updated with security PINs, card details and Gov ID!');
  await mongoose.disconnect();
}

updateUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
