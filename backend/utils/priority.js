// Experiment 5: custom Node module (like mathUtils) holding the hospital's priority rules
const { add, multiply, subtract } = require('./mathUtils');

const SEVERITY_LABELS = { 1: 'Minor', 2: 'Moderate', 3: 'Serious', 4: 'Critical', 5: 'Life-threatening' };

// Higher score = treated sooner
function priorityScore(patient, now = Date.now()) {
  const waitingMinutes = subtract(now, new Date(patient.arrivalTime).getTime()) / 60000;
  const severityScore = multiply(patient.severity, 40);
  const waitingScore = Math.min(waitingMinutes * 0.5, 30);
  const distanceScore = Math.max(0, 20 - (patient.distanceKm || 0) * 0.5);
  const ageScore = patient.age >= 65 || patient.age <= 5 ? 10 : 0;
  return add(add(severityScore, waitingScore), add(distanceScore, ageScore));
}

// Which wards to try, in order, for a given severity
function wardPreference(severity) {
  if (severity >= 4) return ['ICU', 'Emergency', 'General'];
  if (severity === 3) return ['Emergency', 'ICU', 'General'];
  return ['General', 'Emergency', 'ICU'];
}

const round1 = (n) => Math.round(n * 10) / 10;

module.exports = { SEVERITY_LABELS, priorityScore, wardPreference, round1 };
