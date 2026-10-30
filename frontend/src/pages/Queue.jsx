// Waiting queue ranked by priority score
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';

function Queue() {
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState('');

  const loadQueue = () =>
    api('/queue')
      .then((data) => setQueue(data.queue))
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadQueue();
    const timer = setInterval(loadQueue, 5000);
    return () => clearInterval(timer);
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!queue) return <Spinner />;

  return (
    <div>
      <h1>Waiting queue</h1>
      <p className="muted">Ranked by priority score: severity, waiting time, distance and age. Updates every 5 seconds.</p>

      {queue.length === 0 ? (
        <p className="empty">Nobody is waiting. Add a patient or load sample patients from the dashboard.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Rank</th><th>Patient</th><th>Condition</th><th>Severity</th><th>Waited (min)</th><th>Score</th></tr>
          </thead>
          <tbody>
            {queue.map((p) => (
              <tr key={p._id}>
                <td>{p.rank}</td>
                <td>{p.name}</td>
                <td>{p.condition}</td>
                <td>{p.severity} - {p.severityLabel}</td>
                <td>{p.waitMinutes}</td>
                <td><strong>{p.score}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Queue;
