// Experiment 3 (Hard): dashboard with statistics. Experiment 2: useEffect with an interval
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Spinner from '../components/Spinner.jsx';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const [busy, setBusy] = useState(false);

  const loadStatus = () =>
    api('/status')
      .then((data) => setStatus(data))
      .catch((err) => setMessage({ type: 'error', text: err.message }));

  // load on mount and refresh every 5 seconds; the cleanup stops the timer
  useEffect(() => {
    loadStatus();
    const timer = setInterval(loadStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const run = async (path, onResult) => {
    setBusy(true);
    setMessage(null);
    try {
      const data = await api(path, { method: 'POST' });
      setMessage(onResult(data));
      await loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setBusy(false);
  };

  const allocateNext = () =>
    run('/allocate-next', (d) => {
      if (d.status === 'allocated') return { type: 'ok', text: `${d.patient} placed in ${d.bedId} (${d.ward}), priority score ${d.score}.` };
      if (d.status === 'no_bed') return { type: 'error', text: `No free bed for ${d.patient}. Release a patient first.` };
      if (d.status === 'busy') return { type: 'error', text: 'Another request just placed that patient. Try again.' };
      return { type: 'error', text: 'No patients are waiting.' };
    });

  const allocateAll = () =>
    run('/allocate-all', (d) => ({ type: 'ok', text: `${d.allocated} patient(s) placed in beds.` }));

  const reset = () => {
    if (!window.confirm('Delete all patients and allocation history, and free every bed?')) return;
    run('/reset', () => ({ type: 'ok', text: 'System reset. All beds are free.' }));
  };

  if (!status) {
    if (!message) return <Spinner />;
    return (
      <div>
        <h1>Dashboard</h1>
        <div className="alert alert-error">{message.text}</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-number">{status.available}</span>
          <span>Beds free of {status.capacity}</span>
        </div>
        <div className="stat">
          <span className="stat-number">{status.occupied}</span>
          <span>Beds occupied</span>
        </div>
        <div className="stat">
          <span className="stat-number">{status.waiting}</span>
          <span>Patients waiting</span>
        </div>
      </div>

      <div className="toolbar allocation-actions">
        <button className="btn" disabled={busy} onClick={allocateNext}>Allocate next patient</button>
        <button className="btn" disabled={busy} onClick={allocateAll}>Allocate all waiting</button>
      </div>
      {message && (
        <div className={`alert ${message.type === 'ok' ? 'alert-ok' : 'alert-error'}`}>{message.text}</div>
      )}

      <h2>Ward occupancy</h2>
      <ul className="bar-list">
        {status.wards.map((w) => (
          <li key={w.name}>
            <span className="bar-label">{w.name}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${w.capacity ? (w.occupied / w.capacity) * 100 : 0}%` }}></span>
            </span>
            <span className="bar-count">{w.occupied}/{w.capacity}</span>
          </li>
        ))}
      </ul>
      <div className="dashboard-reset">
        <button className="btn btn-danger" disabled={busy} onClick={reset}>Reset system</button>
      </div>
    </div>
  );
}

export default Dashboard;
