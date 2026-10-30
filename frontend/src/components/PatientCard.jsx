// Experiment 1 (Medium): reusable component that receives data through props
import { Link } from 'react-router-dom';
import { SEVERITY_LABELS } from '../severity.js';

function PatientCard({ id, name, age, condition, severity, status, bed, onEdit, onDelete, onRelease }) {
  return (
    <div className="student-card">
      <div className={`grade grade-${severity}`} title={SEVERITY_LABELS[severity]}>{severity}</div>
      <div className="student-info">
        <Link to={`/patients/${id}`} className="student-name">{name}</Link>
        <p>{condition}</p>
        <p className="muted">
          Age {age} - {SEVERITY_LABELS[severity]}
          <span className={`pill pill-${status}`}>{status}</span>
          {bed && <span className="muted"> Bed {bed.bedId}</span>}
        </p>
      </div>
      <div className="card-actions">
        {status === 'admitted' && <button className="btn btn-small" onClick={onRelease}>Release</button>}
        <button className="btn btn-small btn-ghost" onClick={onEdit}>Edit</button>
        <button className="btn btn-small btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

export default PatientCard;
