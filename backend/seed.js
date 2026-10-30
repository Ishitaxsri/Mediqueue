// Optional: "npm run seed" clears patients and adds 10 sample patients to the waiting queue
require('dotenv').config();
const connectDB = require('./config/db');
const { ensureBeds } = require('./config/beds');
const Patient = require('./models/Patient');
const Bed = require('./models/Bed');
const AllocationLog = require('./models/AllocationLog');

(async () => {
  await connectDB();
  await ensureBeds();
  await Patient.deleteMany();
  await AllocationLog.deleteMany();
  await Bed.updateMany({}, { isAvailable: true, patient: null });
  await Patient.insertMany([
    { name: 'Alice Monroe', age: 72, condition: 'Cardiac Arrest', severity: 5, distanceKm: 2.1 },
    { name: 'Bob Carter', age: 45, condition: 'Fractured Femur', severity: 3, distanceKm: 8.5 },
    { name: 'Carol Smith', age: 67, condition: 'Stroke', severity: 4, distanceKm: 1.3 },
    { name: 'David Lee', age: 30, condition: 'Severe Laceration', severity: 2, distanceKm: 15 },
    { name: 'Emma Johnson', age: 3, condition: 'Respiratory Failure', severity: 5, distanceKm: 0.8 },
  ]);
  console.log('Sample patients added');
  process.exit(0);
})();
