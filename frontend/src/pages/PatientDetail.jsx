// Experiment 3 (Medium): detail page using a route param (/patients/:id)
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';
import { SEVERITY_LABELS } from '../severity.js';

function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/patients/${id}`)
      .then((data) => setPatient(data.patient))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!patient) return <Spinner />;

  return (
    <div className="detail">
      <Link to="/patients">Back to patients</Link>
      <h1>{patient.name}</h1>
      <dl>
        <dt>Age</dt><dd>{patient.age}</dd>
        <dt>Condition</dt><dd>{patient.condition}</dd>
        <dt>Severity</dt><dd>{patient.severity} - {SEVERITY_LABELS[patient.severity]}</dd>
        <dt>Distance</dt><dd>{patient.distanceKm} km</dd>
        <dt>Status</dt><dd>{patient.status}</dd>
        <dt>Bed</dt><dd>{patient.bed ? `${patient.bed.bedId} (${patient.bed.ward})` : 'Not assigned'}</dd>
        <dt>Arrived</dt><dd>{new Date(patient.arrivalTime).toLocaleString()}</dd>
      </dl>
    </div>
  );
}

export default PatientDetail;
