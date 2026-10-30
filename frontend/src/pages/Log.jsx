// Allocation history
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';

function Log() {
  const [log, setLog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/log')
      .then((data) => setLog(data.log))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!log) return <Spinner />;

  return (
    <div>
      <h1>Allocation log</h1>
      {log.length === 0 ? (
        <p className="empty">No beds have been allocated yet. Use "Allocate next patient" on the dashboard.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Time</th><th>Patient</th><th>Ward</th><th>Bed</th><th>Score</th><th>Waited (min)</th></tr>
          </thead>
          <tbody>
            {log.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.createdAt).toLocaleTimeString()}</td>
                <td>{entry.patientName}</td>
                <td>{entry.ward}</td>
                <td>{entry.bedId}</td>
                <td>{entry.score}</td>
                <td>{entry.waitMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Log;
