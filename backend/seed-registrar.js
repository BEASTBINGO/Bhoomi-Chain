require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bhoomichain');
  
  const existing = await User.findOne({ role: { $in: ['REGISTRAR', 'ADMIN'] } });
  if (existing) {
    console.log('✅ Registrar already exists:');
    console.log('   BCID:', existing.bcid);
    console.log('   Mobile:', existing.mobile);
    console.log('   Role:', existing.role);
    console.log('   Name:', existing.fullName);
  } else {
    const reg = await User.create({
      bcid: 'BREG-MH-2026-000001',
      fullName: 'Shri Ramesh Patil',
      dob: new Date('1980-06-15'),
      fatherName: 'Vishnu Patil',
      mobile: '9000000001',
      address: 'Sub-Registrar Office, Pune Division, Maharashtra',
      role: 'REGISTRAR',
      identityVerificationStatus: 'VERIFIED'
    });
    console.log('✅ Created registrar:');
    console.log('   BCID:', reg.bcid);
    console.log('   Mobile:', reg.mobile);
    console.log('   Role:', reg.role);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error(err); process.exit(1); });
