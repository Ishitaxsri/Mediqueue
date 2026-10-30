// Creates the hospital's beds the first time the server starts
const Bed = require('../models/Bed');

const WARD_CAPACITY = { ICU: 5, Emergency: 10, General: 15 };

async function ensureBeds() {
  const beds = [];
  for (const [ward, capacity] of Object.entries(WARD_CAPACITY)) {
    const existing = new Set(
      (await Bed.find({ ward }).select('bedId')).map((bed) => bed.bedId)
    );
    for (let i = 1; i <= capacity; i++) {
      const bedId = `${ward}-B${String(i).padStart(2, '0')}`;
      if (!existing.has(bedId)) beds.push({ bedId, ward });
    }
  }
  if (beds.length > 0) {
    await Bed.insertMany(beds);
    console.log(`${beds.length} beds created`);
  }
}

module.exports = { ensureBeds, WARD_CAPACITY };
