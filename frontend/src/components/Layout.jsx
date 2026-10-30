import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

function Layout() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
