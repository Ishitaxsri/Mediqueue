// Experiment 6 (Hard): global 4-parameter error handler returning consistent JSON
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value: that record already exists';
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
