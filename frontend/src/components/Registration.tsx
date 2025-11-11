import { useState, useEffect } from 'react';
import { registerAttendee, getAttendeeCount } from '../services/api';
import type { RegisterRequest } from '../types';
import ConfirmationPopup from './ConfirmationPopup';
import './Registration.css';

const DESIGNATIONS = [
  'Software Engineer',
  'Product Manager',
  'Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Other',
];

const Registration: React.FC = () => {
  const [count, setCount] = useState(0);
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    designation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const currentCount = await getAttendeeCount();
        setCount(currentCount);
      } catch (error) {
        console.error('Failed to fetch attendee count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerAttendee(formData);
      setRegisteredName(formData.fullName);
      setShowPopup(true);
      setFormData({ fullName: '', email: '', designation: '' });
      // Refresh count
      const newCount = await getAttendeeCount();
      setCount(newCount);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="registration-section" id="register">
      <div className="container">
        <h2 className="section-title">Register for the Event</h2>
        <div className="registration-content">
          <div className="attendee-count">
            <div className="count-display">
              <span className="count-label">Live Attendee Count:</span>
              <span className="count-number">{count}</span>
            </div>
          </div>

          <div className="registration-form-container">
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <select
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                >
                  <option value="">Select your designation</option>
                  {DESIGNATIONS.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="register-button" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPopup && (
        <ConfirmationPopup
          onClose={() => setShowPopup(false)}
          attendeeName={registeredName}
        />
      )}
    </section>
  );
};

export default Registration;

