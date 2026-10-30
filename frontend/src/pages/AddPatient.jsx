// Experiment 9 (Medium): form that POSTs a new patient to the backend
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import PatientForm from '../components/PatientForm.jsx';

function AddPatient() {
  const navigate = useNavigate();

  const handleAdd = async (data) => {
    await api('/patients', { method: 'POST', body: data });
    navigate('/patients');
  };

  return (
    <div>
      <h1>Add patient</h1>
      <PatientForm onSubmit={handleAdd} submitLabel="Add to waiting queue" />
    </div>
  );
}

export default AddPatient;
