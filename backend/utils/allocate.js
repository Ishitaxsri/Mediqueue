// Bed allocation logic: pick the highest-priority waiting patient and give them the best free bed.
// Beds and patients are claimed with single atomic updates (findOneAndUpdate), so two requests
// running at the same time can never give one bed to two patients or admit one patient twice.
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const AllocationLog = require('../models/AllocationLog');
const { priorityScore, wardPreference, round1 } = require('./priority');

async function allocateNext() {
  const waiting = await Patient.find({ status: 'waiting' });
  if (waiting.length === 0) return { status: 'empty' };

  const now = Date.now();
  waiting.sort((a, b) => priorityScore(b, now) - priorityScore(a, now));
  const patient = waiting[0];

  for (const ward of wardPreference(patient.severity)) {
    // Atomically claim the first free bed in this ward (the filter and the update are one operation)
    const bed = await Bed.findOneAndUpdate(
      { ward, isAvailable: true },
      { isAvailable: false, patient: patient._id },
      { sort: { bedId: 1 }, new: true }
    );
    if (!bed) continue;

    // Atomically claim the patient; fails if another request already admitted them
    const claimed = await Patient.findOneAndUpdate(
      { _id: patient._id, status: 'waiting' },
      { status: 'admitted', bed: bed._id },
      { new: true }
    );
    if (!claimed) {
      // Lost the race: give the bed back and let the caller try again
      await Bed.findByIdAndUpdate(bed._id, { isAvailable: true, patient: null });
      return { status: 'busy', patient: patient.name };
    }

    const score = round1(priorityScore(claimed, now));
    const waitMinutes = round1((now - claimed.arrivalTime.getTime()) / 60000);
    await AllocationLog.create({
      patient: claimed._id,
      patientName: claimed.name,
      severity: claimed.severity,
      ward,
      bedId: bed.bedId,
      score,
      waitMinutes,
    });
    return { status: 'allocated', patient: claimed.name, ward, bedId: bed.bedId, score };
  }

  return { status: 'no_bed', patient: patient.name };
}

module.exports = { allocateNext };
