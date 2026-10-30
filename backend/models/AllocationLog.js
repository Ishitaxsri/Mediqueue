const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patientName: String,
    severity: Number,
    ward: String,
    bedId: String,
    score: Number,
    waitMinutes: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AllocationLog', logSchema);
