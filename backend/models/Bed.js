const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedId: { type: String, required: true, unique: true },
  ward: { type: String, enum: ['ICU', 'Emergency', 'General'], required: true },
  isAvailable: { type: Boolean, default: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
});

module.exports = mongoose.model('Bed', bedSchema);
