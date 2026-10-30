// Experiments 2, 4, 9: patient list with fetch + loading + error + live search,
// filters, sort, pagination, edit modal, delete and release with real-time sync
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import PatientCard from '../components/PatientCard.jsx';
import PatientForm from '../components/PatientForm.jsx';
import Spinner from '../components/Spinner.jsx';
import { SEVERITY_LABELS } from '../severity.js';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = `?search=${encodeURIComponent(search)}&severity=${severity}&status=${status}&sort=${sort}&page=${page}&limit=6`;
    api('/patients' + query)
      .then((data) => {
        setPatients(data.patients);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, severity, status, sort, page, reload]);

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Delete ${patient.name}?`)) return;
    try {
      await api(`/patients/${patient._id}`, { method: 'DELETE' });
      if (patients.length === 1 && page > 1) setPage(page - 1);
      else setReload(reload + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRelease = async (patient) => {
    try {
      await api(`/release/${patient._id}`, { method: 'POST' });
      setReload(reload + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (data) => {
    await api(`/patients/${editing._id}`, { method: 'PUT', body: data });
    setEditing(null);
    setReload(reload + 1);
  };

  return (
    <div>
      <h1>Patients</h1>

      <div className="toolbar">
        <input className="search" placeholder="Search by name" value={search} onChange={resetPage(setSearch)} />
        <select value={severity} onChange={resetPage(setSeverity)}>
          <option value="">All severities</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} - {SEVERITY_LABELS[n]}</option>)}
        </select>
        <select value={status} onChange={resetPage(setStatus)}>
          <option value="">All statuses</option>
          <option value="waiting">Waiting</option>
          <option value="admitted">Admitted</option>
          <option value="discharged">Discharged</option>
        </select>
        <select value={sort} onChange={resetPage(setSort)}>
          <option value="">Newest first</option>
          <option value="severity_desc">Most severe first</option>
          <option value="age_asc">Age: low to high</option>
          <option value="age_desc">Age: high to low</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Spinner />
      ) : patients.length === 0 ? (
        <p className="empty">No patients match. Try a different search, or add a patient.</p>
      ) : (
        <>
          <p className="muted">{total} patient{total === 1 ? '' : 's'} found</p>
          <div className="card-list">
            {patients.map((p) => (
              <PatientCard
                key={p._id}
                id={p._id}
                name={p.name}
                age={p.age}
                condition={p.condition}
                severity={p.severity}
                status={p.status}
                bed={p.bed}
                onEdit={() => setEditing(p)}
                onDelete={() => handleDelete(p)}
                onRelease={() => handleRelease(p)}
              />
            ))}
          </div>

          <div className="pager">
            <button className="btn btn-small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="btn btn-small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}

      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit {editing.name}</h2>
            <PatientForm initial={editing} onSubmit={handleUpdate} submitLabel="Save changes" />
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
