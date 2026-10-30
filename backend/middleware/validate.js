// Experiment 6 (Hard): request validation middleware - rejects patient requests missing required fields
const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === '');
  if (missing.length > 0) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  next();
};

module.exports = {
  validatePatient: requireFields(['name', 'age', 'condition', 'severity']),
};
