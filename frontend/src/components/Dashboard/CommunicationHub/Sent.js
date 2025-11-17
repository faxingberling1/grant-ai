import React, { useState, useEffect } from 'react';
import './Sent.css';

const Sent = () => {
  const [sentEmails, setSentEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    // Mock sent emails data
    const mockSentEmails = [
      {
        id: 1,
        to: 'foundation@example.com',
        toName: 'ABC Foundation',
        subject: 'Grant Proposal Submission - Q4 Funding',
        preview: 'Attached please find our complete grant proposal for the Q4 funding cycle...',
        date: '2024-01-14T15:30:00Z',
        status: 'delivered'
      },
      {
        id: 2,
        to: 'client@nonprofit.org',
        toName: 'Sarah Johnson - Hope Center',
        subject: 'Draft Budget Proposal for Review',
        preview: 'As discussed, here is the draft budget proposal for your upcoming grant application...',
        date: '2024-01-13T11:20:00Z',
        status: 'read'
      },
      {
        id: 3,
        to: 'partner@collab.org',
        toName: 'Community Partners Inc.',
        subject: 'Collaboration Opportunity - Education Grant',
        preview: 'I came across an excellent education grant opportunity that aligns with both our missions...',
        date: '2024-01-12T09:45:00Z',
        status: 'delivered'
      }
    ];
    setSentEmails(mockSentEmails);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return 'fas fa-check-double text-success';
      case 'delivered':
        return 'fas fa-check text-info';
      case 'failed':
        return 'fas fa-exclamation-triangle text-error';
      default:
        return 'fas fa-check text-muted';
    }
  };

  return (
    <div className="sent-container">
      <div className="sent-header">
        <h2>Sent</h2>
        <div className="sent-stats">
          <span className="stat-item">
            <strong>{sentEmails.length}</strong> emails sent
          </span>
        </div>
      </div>

      <div className="sent-content">
        <div className="email-list">
          {sentEmails.map(email => (
            <div 
              key={email.id}
              className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="email-recipient">
                <span className="recipient-name">To: {email.toName}</span>
              </div>
              <div className="email-content">
                <div className="email-subject">
                  {email.subject}
                  <i className={getStatusIcon(email.status)}></i>
                </div>
                <div className="email-preview">{email.preview}</div>
              </div>
              <div className="email-meta">
                <span className="email-date">
                  {new Date(email.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedEmail && (
          <div className="email-detail">
            <div className="email-detail-header">
              <h3>{selectedEmail.subject}</h3>
              <div className="email-detail-meta">
                <div className="meta-item">
                  <strong>To:</strong> {selectedEmail.toName} &lt;{selectedEmail.to}&gt;
                </div>
                <div className="meta-item">
                  <strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> 
                  <span className={`status status-${selectedEmail.status}`}>
                    <i className={getStatusIcon(selectedEmail.status)}></i>
                    {selectedEmail.status.charAt(0).toUpperCase() + selectedEmail.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="email-detail-body">
              <p>This is the content of the sent email. In a real application, this would show the actual email content that was sent.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sent;