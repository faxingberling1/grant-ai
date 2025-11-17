import React, { useState, useEffect } from 'react';
import './Starred.css';

const Starred = () => {
  const [starredEmails, setStarredEmails] = useState([]);

  useEffect(() => {
    // Mock starred emails data
    const mockStarredEmails = [
      {
        id: 1,
        from: 'foundation@example.com',
        fromName: 'ABC Foundation',
        subject: 'Important: Grant Application Deadline Reminder',
        preview: 'This is a reminder that the deadline for the Q4 grant application is approaching...',
        date: '2024-01-15T10:30:00Z',
        read: true
      },
      {
        id: 2,
        from: 'team@grantflow.com',
        fromName: 'GrantFlow Team',
        subject: 'Weekly Grant Opportunities Digest',
        preview: 'This week we have identified 15 new grant opportunities matching your expertise areas...',
        date: '2024-01-13T16:45:00Z',
        read: true
      }
    ];
    setStarredEmails(mockStarredEmails);
  }, []);

  return (
    <div className="starred-container">
      <div className="starred-header">
        <h2>
          <i className="fas fa-star starred-icon"></i>
          Starred
        </h2>
        <span className="starred-count">{starredEmails.length} starred emails</span>
      </div>

      <div className="starred-content">
        {starredEmails.length > 0 ? (
          <div className="starred-list">
            {starredEmails.map(email => (
              <div key={email.id} className="starred-item">
                <div className="starred-item-header">
                  <div className="sender-info">
                    <strong>{email.fromName}</strong>
                    <span>&lt;{email.from}&gt;</span>
                  </div>
                  <div className="email-date">
                    {new Date(email.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="starred-subject">
                  <i className="fas fa-star starred-indicator"></i>
                  {email.subject}
                </div>
                <div className="starred-preview">
                  {email.preview}
                </div>
                <div className="starred-actions">
                  <button className="btn btn-outline btn-sm">
                    <i className="fas fa-envelope-open"></i>
                    View
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <i className="fas fa-star"></i>
                    Unstar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-star empty-icon"></i>
            <h3>No Starred Emails</h3>
            <p>Star important emails to find them quickly here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Starred;