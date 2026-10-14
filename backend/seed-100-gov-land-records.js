require('dotenv').config();
const mongoose = require('mongoose');
const GovLandRecord = require('./src/models/GovLandRecord');

const FIRST_NAMES = [
  'Rajesh', 'Suresh', 'Dattatray', 'Ankush', 'Santosh', 'Mahesh', 'Ganesh', 'Nitin',
  'Prakash', 'Sunil', 'Vijay', 'Sachin', 'Vinayak', 'Pradeep', 'Ashok', 'Sanjay',
  'Balasaheb', 'Chandrakant', 'Tukaram', 'Pandurang', 'Kisan', 'Eknath', 'Anand', 'Hemant',
  'Suvarna', 'Sunita', 'Rekha', 'Archana', 'Shubhangi', 'Mangal', 'Lata', 'Vaishali'
];

const LAST_NAMES = [
  'Patil', 'Deshmukh', 'Kadam', 'Pawar', 'Chavan', 'Jadhav', 'Shinde', 'Bhosale',
  'Gaikwad', 'More', 'Salunkhe', 'Sawant', 'Mane', 'Thorat', 'Tambe', 'Ghadge',
  'Kulkarni', 'Joshi', 'Bhave', 'Godbole', 'Naik', 'Rane', 'Chitnis', 'Gore'
];

const LOCATIONS = [
  { district: 'Palghar', taluka: 'Vasai', village: 'Bolinj' },
  { district: 'Palghar', taluka: 'Palghar', village: 'Manor' },
  { district: 'Palghar', taluka: 'Dahanu', village: 'Gholvad' },
  { district: 'Pune', taluka: 'Haveli', village: 'Wagholi' },
  { district: 'Pune', taluka: 'Mulshi', village: 'Pirangut' },
  { district: 'Pune', taluka: 'Maval', village: 'Talegaon' },
  { district: 'Thane', taluka: 'Kalyan', village: 'Dombivli' },
  { district: 'Thane', taluka: 'Bhiwandi', village: 'Padgha' },
  { district: 'Thane', taluka: 'Ambernath', village: 'Badlapur' },
  { district: 'Nashik', taluka: 'Dindori', village: 'Janori' },
  { district: 'Nashik', taluka: 'Igatpuri', village: 'Ghoti' },
  { district: 'Nagpur', taluka: 'Hingna', village: 'Wadi' },
  { district: 'Raigad', taluka: 'Alibag', village: 'Varsoli' },
  { district: 'Raigad', taluka: 'Panvel', village: 'Karanjade' },
  { district: 'Satara', taluka: 'Karad', village: 'Ogalewadi' },
  { district: 'Kolhapur', taluka: 'Karveer', village: 'Uchgaon' }
];

const TYPES = ['AGRICULTURAL_LAND', 'RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'INDUSTRIAL_LAND'];

async function seedMasterDatabase() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhoomichain');
  console.log('Connected to MongoDB');

  // Clear existing master land records
  await GovLandRecord.deleteMany({});
  console.log('Cleared old GovLandRecord collection.');

  const records = [];

  // 1. Record for Mehul Kasrung's property (BCP-2026-000001, SUR-1024)
  records.push({
    surveyNumber: 'SUR-1024',
    gatNumber: 'GAT-104/A',
    propertyCode: 'BCP-2026-000001',
    ownerName: 'Mehul Kasrung',
    ownerAadhaar: '5489 3210 1001',
    ownerPhone: '9876543210',
    propertyType: 'RESIDENTIAL_LAND',
    area: 1200,
    areaUnit: 'sq.ft',
    district: 'Palghar',
    taluka: 'Vasai',
    village: 'Bolinj',
    address: 'Survey No. 1024, Plot No. 14, Near Bolinj Naka, Virar West, Palghar, Maharashtra',
    marketValue: 4500000,
    isRegisteredOnBhoomiChain: true,
    landStatus: 'CLEAN_TITLE',
    taxClearanceStatus: 'PAID',
    lastRevenueAssessmentYear: 2025,
    governmentSealNumber: 'REV-MH-PAL-001024',
  });

  // 2. Record for Pooja Sharma's transferred property (BCP-2026-000003, SUR-1025)
  records.push({
    surveyNumber: 'SUR-1025',
    gatNumber: 'GAT-105/B',
    propertyCode: 'BCP-2026-000003',
    ownerName: 'Pooja Sharma',
    ownerAadhaar: '5489 3210 1002',
    ownerPhone: '9876543211',
    propertyType: 'RESIDENTIAL_LAND',
    area: 1500,
    areaUnit: 'sq.ft',
    district: 'Palghar',
    taluka: 'Vasai',
    village: 'Bolinj',
    address: 'Survey No. 1025, Estate Green Acres, Bolinj West, Virar, Palghar, Maharashtra',
    marketValue: 3500000,
    isRegisteredOnBhoomiChain: true,
    landStatus: 'CLEAN_TITLE',
    taxClearanceStatus: 'PAID',
    lastRevenueAssessmentYear: 2025,
    governmentSealNumber: 'REV-MH-PAL-001025',
  });

  // 3. Record for Vikram Dnyaneshwar Patil (BCID-IND-2026-000003, SUR-1026)
  records.push({
    surveyNumber: 'SUR-1026',
    gatNumber: 'GAT-106/C',
    propertyCode: 'MH-PAL-2026-001026',
    ownerName: 'Vikram Dnyaneshwar Patil',
    ownerAadhaar: '5489-3210-6015',
    ownerPhone: '9876546015',
    propertyType: 'AGRICULTURAL_LAND',
    area: 43560,
    areaUnit: 'sq.ft',
    district: 'Palghar',
    taluka: 'Vasai',
    village: 'Bolinj',
    address: 'Agricultural Parcel Gat 106, Bolinj Shivar, Virar West, Palghar, Maharashtra',
    marketValue: 6200000,
    isRegisteredOnBhoomiChain: false,
    landStatus: 'CLEAN_TITLE',
    taxClearanceStatus: 'PAID',
    lastRevenueAssessmentYear: 2025,
    governmentSealNumber: 'REV-MH-PAL-001026',
  });

  // 4. Generate 97 more realistic properties (total 100)
  for (let i = 4; i <= 100; i++) {
    const sNo = 1026 + i - 3;
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const pType = TYPES[Math.floor(Math.random() * TYPES.length)];
    const area = pType === 'AGRICULTURAL_LAND'
      ? Math.floor(20000 + Math.random() * 80000)
      : Math.floor(1000 + Math.random() * 8000);
    const value = Math.floor(1500000 + Math.random() * 8500000);
    const isDisputed = i % 17 === 0;
    const isMortgaged = i % 13 === 0;
    const isGovLease = i % 29 === 0;

    let status = 'CLEAN_TITLE';
    if (isDisputed) status = 'DISPUTED';
    else if (isMortgaged) status = 'MORTGAGED';
    else if (isGovLease) status = 'GOVERNMENT_LEASE';

    const aadhaarRand1 = String(Math.floor(1000 + Math.random() * 9000));
    const aadhaarRand2 = String(Math.floor(1000 + Math.random() * 9000));
    const aadhaarRand3 = String(1000 + i);

    records.push({
      surveyNumber: `SUR-${sNo}`,
      gatNumber: `GAT-${Math.floor(50 + Math.random() * 400)}/${String.fromCharCode(65 + (i % 6))}`,
      propertyCode: `MH-${loc.district.substring(0, 3).toUpperCase()}-2026-${String(sNo).padStart(6, '0')}`,
      ownerName: `${fn} ${ln}`,
      ownerAadhaar: `${aadhaarRand1} ${aadhaarRand2} ${aadhaarRand3}`,
      ownerPhone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
      propertyType: pType,
      area,
      areaUnit: 'sq.ft',
      district: loc.district,
      taluka: loc.taluka,
      village: loc.village,
      address: `Survey No. ${sNo}, Village ${loc.village}, Taluka ${loc.taluka}, District ${loc.district}, Maharashtra`,
      marketValue: value,
      isRegisteredOnBhoomiChain: i % 8 === 0, // a few already registered
      landStatus: status,
      taxClearanceStatus: i % 11 === 0 ? 'PENDING_CLEARANCE' : 'PAID',
      lastRevenueAssessmentYear: 2023 + (i % 3),
      governmentSealNumber: `REV-MH-${loc.district.substring(0, 3).toUpperCase()}-${String(sNo).padStart(6, '0')}`,
    });
  }

  await GovLandRecord.insertMany(records);
  console.log(`✅ Successfully seeded ${records.length} Master Government Land Records in MongoDB!`);
  await mongoose.disconnect();
}

seedMasterDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
