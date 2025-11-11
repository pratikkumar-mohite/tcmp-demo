import { useEffect, useState } from 'react';
import { getSessions } from '../services/api';
import type { SessionWithSpeaker } from '../types';
import './SessionsSpeakers.css';

const SessionsSpeakers: React.FC = () => {
  const [sessions, setSessions] = useState<SessionWithSpeaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <section className="sessions-section">
        <div className="container">
          <h2 className="section-title">Sessions & Speakers</h2>
          <div className="loading">Loading sessions...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="sessions-section" id="sessions">
      <div className="container">
        <h2 className="section-title">Sessions & Speakers</h2>
        <div className="sessions-grid">
          {sessions.length === 0 ? (
            <div className="no-sessions">No sessions available yet. Check back soon!</div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3 className="session-title">{session.title}</h3>
                  {session.time && <span className="session-time">{session.time}</span>}
                </div>
                <p className="session-description">{session.description}</p>
                {session.speaker && (
                  <div className="speaker-info">
                    {session.speaker.photoURL && (
                      <img
                        src={session.speaker.photoURL}
                        alt={session.speaker.name}
                        className="speaker-photo"
                      />
                    )}
                    <div className="speaker-details">
                      <h4 className="speaker-name">{session.speaker.name}</h4>
                      <p className="speaker-bio">{session.speaker.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SessionsSpeakers;

