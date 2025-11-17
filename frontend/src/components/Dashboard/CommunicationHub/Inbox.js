import React, { useState, useEffect } from 'react';
import './Inbox.css';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEmails = [
      {
        id: 1,
        from: 'foundation@example.com',
        fromName: 'ABC Foundation',
        subject: 'Grant Application Update - Q4 Funding Cycle',
        preview: 'We are pleased to inform you that your grant application has moved to the next stage of review...',
        date: '2024-01-15T10:30:00Z',
        read: false,
        starred: true,
        attachments: 2
      },
      {
        id: 2,
        from: 'client@nonprofit.org',
        fromName: 'Sarah Johnson - Hope Center',
        subject: 'Meeting Request: Budget Discussion',
        preview: 'Thank you for the draft proposal. I would like to schedule a meeting to discuss the budget allocation...',
        date: '2024-01-14T14:20:00Z',
        read: true,
        starred: false,
        attachments: 1
      },
      {
        id: 3,
        from: 'grants@gov.org',
        fromName: 'Federal Grants Department',
        subject: 'Required Documentation for HHS-2024-001',
        preview: 'Your grant application HHS-2024-001 requires additional documentation to complete the submission process...',
        date: '2024-01-14T09:15:00Z',
        read: true,
        starred: false,
        attachments: 0
      },
      {
        id: 4,
        from: 'team@grantflow.com',
        fromName: 'GrantFlow Team',
        subject: 'Weekly Grant Opportunities Digest',
        preview: 'This week we have identified 15 new grant opportunities matching your expertise areas...',
        date: '2024-01-13T16:45:00Z',
        read: true,
        starred: true,
        attachments: 1
      }
    ];
    setEmails(mockEmails);
  }, []);

  const markAsRead = (emailId) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  const toggleStar = (emailId) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread') return !email.read;
    if (filter === 'starred') return email.starred;
    return true;
  });

  const unreadCount = emails.filter(email => !email.read).length;

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <div className="inbox-title">
          <h2>Inbox</h2>
          <span className="email-count">{unreadCount} unread</span>
        </div>
        <div className="inbox-actions">
          <button className="btn btn-primary">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
          <button className="btn btn-outline">
            <i className="fas fa-filter"></i>
            Filter
          </button>
        </div>
      </div>

      <div className="inbox-content">
        <div className="inbox-sidebar">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <i className="fas fa-inbox"></i>
              All Emails
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <i className="fas fa-envelope"></i>
              Unread
            </button>
            <button 
              className={`filter-btn ${filter === 'starred' ? 'active' : ''}`}
              onClick={() => setFilter('starred')}
            >
              <i className="fas fa-star"></i>
              Starred
            </button>
          </div>
        </div>

        <div className="inbox-main">
          <div className="email-list">
            {filteredEmails.map(email => (
              <div 
                key={email.id}
                className={`email-item ${!email.read ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedEmail(email);
                  markAsRead(email.id);
                }}
              >
                <div className="email-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="email-star" onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(email.id);
                }}>
                  <i className={`fas fa-star ${email.starred ? 'starred' : ''}`}></i>
                </div>
                <div className="email-sender">
                  <span className="sender-name">{email.fromName}</span>
                </div>
                <div className="email-content">
                  <div className="email-subject">
                    {email.subject}
                    {email.attachments > 0 && (
                      <i className="fas fa-paperclip attachment-indicator"></i>
                    )}
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
                <div className="email-detail-title">
                  <h3>{selectedEmail.subject}</h3>
                  <div className="email-actions">
                    <button className="btn-icon" title="Reply">
                      <i className="fas fa-reply"></i>
                    </button>
                    <button className="btn-icon" title="Forward">
                      <i className="fas fa-share"></i>
                    </button>
                    <button className="btn-icon" title="Delete">
                      <i className="fas fa-trash"></i>
                    </button>
                    <button className="btn-icon" title="Print">
                      <i className="fas fa-print"></i>
                    </button>
                  </div>
                </div>
                <div className="email-detail-sender">
                  <div className="sender-info">
                    <strong>{selectedEmail.fromName}</strong>
                    <span>&lt;{selectedEmail.from}&gt;</span>
                  </div>
                  <div className="email-detail-date">
                    {new Date(selectedEmail.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="email-detail-body">
                <p>This is a detailed view of the email content. In a real application, this would contain the full email body with formatting, links, and attachments.</p>
                
                {selectedEmail.attachments > 0 && (
                  <div className="email-attachments">
                    <h4>Attachments ({selectedEmail.attachments})</h4>
                    <div className="attachment-list">
                      <div className="attachment-item">
                        <i className="fas fa-file-pdf"></i>
                        <span>budget_proposal.pdf</span>
                        <button className="btn-download">Download</button>
                      </div>
                      <div className="attachment-item">
                        <i className="fas fa-file-word"></i>
                        <span>project_timeline.docx</span>
                        <button className="btn-download">Download</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;