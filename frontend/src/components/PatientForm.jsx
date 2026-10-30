// Experiment 2 (Medium): controlled form using useState (two-way binding)
import { useState } from 'react';
import { SEVERITY_LABELS } from '../severity.js';

function PatientForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    age: initial?.age ?? '',
    condition: initial?.condition || '',
    severity: initial?.severity || 3,
    distanceKm: initial?.distanceKm ?? 0,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        age: Number(form.age),
        severity: Number(form.severity),
        distanceKm: Number(form.distanceKm),
      });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label>Patient name
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Carol Smith" />
      </label>
      <label>Age
        <input name="age" type="number" value={form.age} onChange={handleChange} />
      </label>
      <label>Condition
        <input name="condition" value={form.condition} onChange={handleChange} placeholder="e.g. Stroke" />
      </label>
      <label>Severity
        <select name="severity" value={form.severity} onChange={handleChange}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} - {SEVERITY_LABELS[n]}</option>
          ))}
        </select>
      </label>
      <label>Distance from hospital (km)
        <input name="distanceKm" type="number" step="0.1" value={form.distanceKm} onChange={handleChange} />
      </label>

      <button className="btn" disabled={saving}>{saving ? 'Saving...' : submitLabel}</button>
    </form>
  );
}

export default PatientForm;
