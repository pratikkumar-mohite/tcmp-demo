import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import SessionsSpeakers from './components/SessionsSpeakers';
import Registration from './components/Registration';
import Location from './components/Location';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TodoApp from './components/TodoApp';
import './styles/App.css';

function AppContent() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && window.location.pathname !== '/admin') {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  if (isAdmin && window.location.pathname === '/admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (window.location.pathname === '/todos') {
    return (
      <div className="app">
        <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>← Back to Home</Link>
        </nav>
        <TodoApp />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">AppDirect India Hands-On Tech Meetup</h1>
      </header>

      <main className="main-content">
        <SessionsSpeakers />
        <Registration />
        <Location />
      </main>

      <footer className="footer">
        <Link to="/todos" className="admin-link" style={{ marginRight: '1rem' }}>
          Todo App
        </Link>
        <a href="#" onClick={(e) => { e.preventDefault(); setShowAdminLogin(true); }} className="admin-link">
          Admin Login
        </a>
      </footer>

      {showAdminLogin && !isAdmin && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AppContent />} />
        <Route path="/todos" element={<AppContent />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
