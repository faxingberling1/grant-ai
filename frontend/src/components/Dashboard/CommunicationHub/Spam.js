import React, { useState, useEffect } from 'react';
import './Spam.css';

const Spam = () => {
  const [spamEmails, setSpamEmails] = useState([]);

  useEffect(() => {
    // Mock spam emails data
    const mockSpamEmails = [
      {
        id: 1,
        from: 'noreply@fake-grants.com',
        fromName: 'Global Grants Foundation',
        subject: 'You Won $50,000 Grant! Click Here to Claim',
        preview: 'Congratulations! You have been selected to receive a $50,000 grant. No application required...',
        date: '2024-01-15T08:20:00Z'
      },
      {
        id: 2,
        from: 'promotions@newsletter-fake.com',
        fromName: 'Grant Opportunities Daily',
        subject: '100+ New Grants Available - Limited Time',
        preview: 'Discover over 100 new grant opportunities with deadlines approaching soon. Special offer inside...',
        date: '2024-01-14T14:30:00Z'
      }
    ];
    setSpamEmails(mockSpamEmails);
  }, []);

  const markAsNotSpam = (emailId) => {
    setSpamEmails(spamEmails.filter(email => email.id !== emailId));
    // In real app, this would call an API to mark as not spam
  };

  const deleteSpam = (emailId) => {
    setSpamEmails(spamEmails.filter(email => email.id !== emailId));
    // In real app, this would permanently delete the email
  };

  const emptySpam = () => {
    setSpamEmails([]);
    // In real app, this would empty the spam folder
  };

  return (
    <div className="spam-container">
      <div className="spam-header">
        <div className="spam-title">
          <h2>
            <i className="fas fa-shield-alt spam-icon"></i>
            Spam
          </h2>
          <span className="spam-count">{spamEmails.length} spam emails</span>
        </div>
        <div className="spam-actions">
          <button 
            className="btn btn-outline"
            onClick={emptySpam}
            disabled={spamEmails.length === 0}
          >
            <i className="fas fa-trash"></i>
            Empty Spam
          </button>
        </div>
      </div>

      <div className="spam-content">
        {spamEmails.length > 0 ? (
          <div className="spam-list">
            {spamEmails.map(email => (
              <div key={email.id} className="spam-item">
                <div className="spam-item-header">
                  <div className="spam-sender">
                    <strong className="spam-sender-name">{email.fromName}</strong>
                    <span className="spam-email">{email.from}</span>
                  </div>
                  <div className="spam-date">
                    {new Date(email.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="spam-subject">
                  <i className="fas fa-exclamation-triangle spam-warning"></i>
                  {email.subject}
                </div>
                <div className="spam-preview">
                  {email.preview}
                </div>
                <div className="spam-item-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => markAsNotSpam(email.id)}
                  >
                    <i className="fas fa-inbox"></i>
                    Not Spam
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => deleteSpam(email.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-shield-alt empty-icon"></i>
            <h3>No Spam Emails</h3>
            <p>Your spam folder is empty. Suspicious emails will be automatically filtered here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Spam;