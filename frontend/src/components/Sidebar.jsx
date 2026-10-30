import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">MediQueue</div>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/patients">Patients</NavLink>
        <NavLink to="/add">Add patient</NavLink>
        <NavLink to="/queue">Waiting queue</NavLink>
        <NavLink to="/log">Allocation log</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
