// Hospital operations: ward status, waiting queue, allocation, release, log, demo data, reset
const express = require('express');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const AllocationLog = require('../models/AllocationLog');
const { allocateNext } = require('../utils/allocate');
const { priorityScore, round1, SEVERITY_LABELS } = require('../utils/priority');

const router = express.Router();


// GET /api/status - bed occupancy per ward
router.get('/status', async (req, res, next) => {
  try {
    const wardNames = ['ICU', 'Emergency', 'General'];
    const wards = await Promise.all(
      wardNames.map(async (name) => ({
        name,
        capacity: await Bed.countDocuments({ ward: name }),
        occupied: await Bed.countDocuments({ ward: name, isAvailable: false }),
      }))
    );
    const capacity = wards.reduce((sum, w) => sum + w.capacity, 0);
    const occupied = wards.reduce((sum, w) => sum + w.occupied, 0);
    const waiting = await Patient.countDocuments({ status: 'waiting' });
    res.json({ success: true, wards, capacity, occupied, available: capacity - occupied, waiting });
  } catch (err) {
    next(err);
  }
});

// GET /api/queue - waiting patients ranked by priority score
router.get('/queue', async (req, res, next) => {
  try {
    const now = Date.now();
    const waiting = await Patient.find({ status: 'waiting' });
    const queue = waiting
      .map((p) => ({
        _id: p._id,
        name: p.name,
        age: p.age,
        condition: p.condition,
        severity: p.severity,
        severityLabel: SEVERITY_LABELS[p.severity],
        distanceKm: p.distanceKm,
        waitMinutes: round1((now - p.arrivalTime.getTime()) / 60000),
        score: round1(priorityScore(p, now)),
      }))
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ rank: i + 1, ...p }));
    res.json({ success: true, queue });
  } catch (err) {
    next(err);
  }
});

// POST /api/allocate-next
router.post('/allocate-next', async (req, res, next) => {
  try {
    const result = await allocateNext();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// POST /api/allocate-all
router.post('/allocate-all', async (req, res, next) => {
  try {
    let allocated = 0;
    while (true) {
      const result = await allocateNext();
      if (result.status === 'busy') continue; // another request took this patient; pick the next one
      if (result.status !== 'allocated') break;
      allocated++;
    }
    res.json({ success: true, allocated });
  } catch (err) {
    next(err);
  }
});

// POST /api/release/:id - discharge an admitted patient and free the bed
router.post('/release/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || patient.status !== 'admitted') {
      return res.status(404).json({ success: false, message: 'Patient not found or not in a bed' });
    }
    await Bed.findByIdAndUpdate(patient.bed, { isAvailable: true, patient: null });
    patient.status = 'discharged';
    patient.bed = null;
    await patient.save();
    res.json({ success: true, message: `${patient.name} released` });
  } catch (err) {
    next(err);
  }
});

// GET /api/log - allocation history, newest first
router.get('/log', async (req, res, next) => {
  try {
    const log = await AllocationLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, log });
  } catch (err) {
    next(err);
  }
});

const DEMO = [
  { name: 'Alice Monroe', age: 72, condition: 'Cardiac Arrest', severity: 5, distanceKm: 2.1 },
  { name: 'Bob Carter', age: 45, condition: 'Fractured Femur', severity: 3, distanceKm: 8.5 },
  { name: 'Carol Smith', age: 67, condition: 'Stroke', severity: 4, distanceKm: 1.3 },
  { name: 'David Lee', age: 30, condition: 'Severe Laceration', severity: 2, distanceKm: 15 },
  { name: 'Emma Johnson', age: 3, condition: 'Respiratory Failure', severity: 5, distanceKm: 0.8 },
  { name: 'Frank Davis', age: 55, condition: 'Mild Concussion', severity: 1, distanceKm: 20.5 },
  { name: 'Grace Kim', age: 80, condition: 'Myocardial Infarction', severity: 4, distanceKm: 5.2 },
  { name: 'Henry Brown', age: 40, condition: 'Appendicitis', severity: 3, distanceKm: 12.3 },
  { name: 'Isla Turner', age: 25, condition: 'Severe Allergic Reaction', severity: 2, distanceKm: 9.7 },
  { name: 'James Wilson', age: 70, condition: 'Traumatic Brain Injury', severity: 5, distanceKm: 3.4 },
];

// POST /api/demo - add 10 sample patients to the waiting queue
router.post('/demo', async (req, res, next) => {
  try {
    await Patient.insertMany(DEMO);
    res.status(201).json({ success: true, loaded: DEMO.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/reset - clear all patients and the log, free every bed
router.post('/reset', async (req, res, next) => {
  try {
    await Patient.deleteMany();
    await AllocationLog.deleteMany();
    await Bed.updateMany({}, { isAvailable: true, patient: null });
    res.json({ success: true, message: 'System reset complete' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
