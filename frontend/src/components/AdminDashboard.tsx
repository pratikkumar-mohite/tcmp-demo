import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getAttendees, getStats, getSpeakers, getSessions, addUpdateSpeaker, addUpdateSession } from '../services/api';
import type { Attendee, Speaker, SessionWithSpeaker, Stats } from '../types';
import './AdminDashboard.css';

interface AdminDashboardProps {
  onLogout: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<SessionWithSpeaker[]>([]);
  const [activeTab, setActiveTab] = useState<'attendees' | 'speakers' | 'sessions'>('attendees');
  const [searchTerm, setSearchTerm] = useState('');

  // Speaker form state
  const [speakerForm, setSpeakerForm] = useState<Partial<Speaker>>({ name: '', bio: '', photoURL: '' });
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  // Session form state
  const [sessionForm, setSessionForm] = useState<Partial<SessionWithSpeaker>>({ title: '', description: '', time: '', speakerId: '' });
  const [editingSession, setEditingSession] = useState<SessionWithSpeaker | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendeesData, statsData, speakersData, sessionsData] = await Promise.all([
        getAttendees(),
        getStats(),
        getSpeakers(),
        getSessions(),
      ]);
      setAttendees(attendeesData);
      setStats(statsData);
      setSpeakers(speakersData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
    window.location.href = '/';
  };

  const handleSpeakerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUpdateSpeaker({
        id: editingSpeaker?.id,
        ...speakerForm,
      });
      setSpeakerForm({ name: '', bio: '', photoURL: '' });
      setEditingSpeaker(null);
      loadData();
    } catch (error) {
      console.error('Failed to save speaker:', error);
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUpdateSession({
        id: editingSession?.id,
        ...sessionForm,
      });
      setSessionForm({ title: '', description: '', time: '', speakerId: '' });
      setEditingSession(null);
      loadData();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = Object.entries(stats).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'attendees' ? 'active' : ''}
          onClick={() => setActiveTab('attendees')}
        >
          Attendees
        </button>
        <button
          className={activeTab === 'speakers' ? 'active' : ''}
          onClick={() => setActiveTab('speakers')}
        >
          Speakers
        </button>
        <button
          className={activeTab === 'sessions' ? 'active' : ''}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
      </div>

      {activeTab === 'attendees' && (
        <div className="admin-content">
          <div className="stats-section">
            <h2>Attendee Breakdown by Designation</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No data available</p>
            )}
          </div>

          <div className="attendees-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="attendees-table-container">
              <table className="attendees-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id}>
                      <td>{attendee.fullName}</td>
                      <td>{attendee.email}</td>
                      <td>{attendee.designation}</td>
                      <td>{new Date(attendee.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'speakers' && (
        <div className="admin-content">
          <form onSubmit={handleSpeakerSubmit} className="admin-form">
            <h2>{editingSpeaker ? 'Update Speaker' : 'Add Speaker'}</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={speakerForm.name || ''}
                onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={speakerForm.bio || ''}
                onChange={(e) => setSpeakerForm({ ...speakerForm, bio: e.target.value })}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                value={speakerForm.photoURL || ''}
                onChange={(e) => setSpeakerForm({ ...speakerForm, photoURL: e.target.value })}
              />
            </div>
            <button type="submit">{editingSpeaker ? 'Update' : 'Add'} Speaker</button>
            {editingSpeaker && (
              <button type="button" onClick={() => { setEditingSpeaker(null); setSpeakerForm({ name: '', bio: '', photoURL: '' }); }}>
                Cancel
              </button>
            )}
          </form>

          <div className="speakers-list">
            <h2>Existing Speakers</h2>
            <div className="speakers-grid">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="speaker-card-admin">
                  {speaker.photoURL && <img src={speaker.photoURL} alt={speaker.name} />}
                  <h3>{speaker.name}</h3>
                  <p>{speaker.bio}</p>
                  <button onClick={() => { setEditingSpeaker(speaker); setSpeakerForm(speaker); }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="admin-content">
          <form onSubmit={handleSessionSubmit} className="admin-form">
            <h2>{editingSession ? 'Update Session' : 'Add Session'}</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={sessionForm.title || ''}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={sessionForm.description || ''}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="text"
                value={sessionForm.time || ''}
                onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                placeholder="e.g., 10:00 AM - 11:00 AM"
              />
            </div>
            <div className="form-group">
              <label>Speaker</label>
              <select
                value={sessionForm.speakerId || ''}
                onChange={(e) => setSessionForm({ ...sessionForm, speakerId: e.target.value })}
              >
                <option value="">Select a speaker</option>
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">{editingSession ? 'Update' : 'Add'} Session</button>
            {editingSession && (
              <button type="button" onClick={() => { setEditingSession(null); setSessionForm({ title: '', description: '', time: '', speakerId: '' }); }}>
                Cancel
              </button>
            )}
          </form>

          <div className="sessions-list">
            <h2>Existing Sessions</h2>
            <div className="sessions-grid-admin">
              {sessions.map((session) => (
                <div key={session.id} className="session-card-admin">
                  <h3>{session.title}</h3>
                  <p>{session.description}</p>
                  <p><strong>Time:</strong> {session.time}</p>
                  {session.speaker && <p><strong>Speaker:</strong> {session.speaker.name}</p>}
                  <button onClick={() => { setEditingSession(session); setSessionForm(session); }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

