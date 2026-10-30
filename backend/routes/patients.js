// Experiments 6 + 8: full CRUD for patients with populate, regex search, filter, sort, pagination
const express = require('express');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const { validatePatient } = require('../middleware/validate');

const router = express.Router();


// GET /api/patients?search=&severity=&status=&sort=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { search, severity, status, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 6, 1);

    const filter = {};
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: safe, $options: 'i' };
    }
    if (severity) filter.severity = Number(severity);
    if (status) filter.status = status;

    let sortBy = { createdAt: -1 };
    if (sort === 'age_asc') sortBy = { age: 1 };
    if (sort === 'age_desc') sortBy = { age: -1 };
    if (sort === 'severity_desc') sortBy = { severity: -1 };

    const total = await Patient.countDocuments(filter);
    const patients = await Patient.find(filter)
      .populate('bed')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, patients, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
});

// GET /api/patients/:id
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('bed');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
});

// POST /api/patients
router.post('/', validatePatient, async (req, res, next) => {
  try {
    const { name, age, condition, severity, distanceKm } = req.body;
    const patient = await Patient.create({ name, age, condition, severity, distanceKm });
    res.status(201).json({ success: true, patient });
  } catch (err) {
    next(err);
  }
});

// PUT /api/patients/:id  (only personal and medical details can be edited)
router.put('/:id', validatePatient, async (req, res, next) => {
  try {
    const { name, age, condition, severity, distanceKm } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, age, condition, severity, distanceKm },
      { new: true, runValidators: true }
    ).populate('bed');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/patients/:id  (frees the bed if the patient was admitted)
router.delete('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    if (patient.bed) {
      await Bed.findByIdAndUpdate(patient.bed, { isAvailable: true, patient: null });
    }
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
