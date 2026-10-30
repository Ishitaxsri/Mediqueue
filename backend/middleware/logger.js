// Experiment 6 (Hard): custom logger middleware (method, URL, timestamp)
// Experiment 5: uses the fs module to also append the log line to a file
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'logs', 'access.log');

const logger = (req, res, next) => {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
  console.log(line);
  fs.appendFile(logFile, line + '\n', () => {});
  next();
};

module.exports = logger;
