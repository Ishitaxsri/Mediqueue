// Experiment 3 (Hard): 404 Not Found page
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/dashboard" className="btn">Go to dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
