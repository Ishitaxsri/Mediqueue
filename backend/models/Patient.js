// Experiment 8: schema with field-level validations and a reference to the Bed model
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], minlength: [3, 'Name must be at least 3 characters'], trim: true },
    age: { type: Number, required: [true, 'Age is required'], min: [0, 'Age cannot be negative'], max: [120, 'Age must be 120 or less'] },
    condition: { type: String, required: [true, 'Condition is required'], trim: true },
    severity: { type: Number, required: [true, 'Severity is required'], min: [1, 'Severity must be 1 to 5'], max: [5, 'Severity must be 1 to 5'] },
    distanceKm: { type: Number, default: 0, min: [0, 'Distance cannot be negative'] },
    status: { type: String, enum: { values: ['waiting', 'admitted', 'discharged'], message: 'Invalid status' }, default: 'waiting' },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', default: null },
    arrivalTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
