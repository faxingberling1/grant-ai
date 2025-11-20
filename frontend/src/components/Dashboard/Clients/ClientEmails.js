import React, { useState } from 'react';
import './ClientEmails.css';

const ClientEmails = ({ client, onBack, onSendEmail, onUseTemplate }) => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedEmails, setSelectedEmails] = useState([]);

  const emailTabs = [
    { id: 'inbox', label: 'Inbox', icon: 'fas fa-inbox', count: 5 },
    { id: 'sent', label: 'Sent', icon: 'fas fa-paper-plane', count: 12 },
    { id: 'drafts', label: 'Drafts', icon: 'fas fa-file-alt', count: 2 },
    { id: 'templates', label: 'Templates', icon: 'fas fa-layer-group', count: 8 }
  ];

  const emails = {
    inbox: [
      {
        id: 1,
        from: 'Sarah Chen',
        email: 'sarah@communityhealth.org',
        subject: 'Grant Proposal Feedback',
        preview: 'Thank you for the detailed proposal. I have some questions about the budget allocation...',
        date: '2024-01-15T10:30:00',
        unread: true,
        important: true,
        attachments: 2
      },
      {
        id: 2,
        from: 'Michael Rodriguez',
        email: 'mike@youthfuture.org',
        subject: 'Meeting Follow-up',
        preview: 'Great meeting yesterday! Here are the action items we discussed...',
        date: '2024-01-14T14:20:00',
        unread: false,
        important: false,
        attachments: 1
      }
    ],
    sent: [
      {
        id: 1,
        to: 'Sarah Chen',
        email: 'sarah@communityhealth.org',
        subject: 'Revised Grant Proposal',
        preview: 'Attached please find the revised grant proposal with the updated budget figures...',
        date: '2024-01-13T09:15:00',
        status: 'delivered'
      }
    ],
    drafts: [
      {
        id: 1,
        to: 'GreenTech Initiative',
        subject: 'Quarterly Review Meeting',
        preview: 'I would like to schedule our quarterly review meeting to discuss...',
        date: '2024-01-12T16:45:00'
      }
    ]
  };

  const templates = [
    {
      id: 1,
      name: 'Initial Grant Inquiry',
      category: 'Proposal',
      subject: 'Grant Opportunity Inquiry - [Organization Name]',
      preview: 'Dear [Contact Name], I am writing to inquire about potential grant opportunities...',
      lastUsed: '2024-01-10'
    },
    {
      id: 2,
      name: 'Proposal Follow-up',
      category: 'Follow-up',
      subject: 'Follow-up on Grant Proposal Submission',
      preview: 'Dear [Contact Name], I wanted to follow up on the grant proposal we submitted...',
      lastUsed: '2024-01-08'
    }
  ];

  const handleEmailSelect = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    const currentEmails = emails[activeTab] || [];
    if (selectedEmails.length === currentEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(currentEmails.map(email => email.id));
    }
  };

  const renderEmailList = () => {
    const currentEmails = emails[activeTab] || [];
    
    return (
      <div className="client-emails-list-container">
        <div className="client-emails-toolbar">
          <div className="client-emails-checkbox">
            <input
              type="checkbox"
              checked={selectedEmails.length > 0 && selectedEmails.length === currentEmails.length}
              onChange={handleSelectAll}
            />
          </div>
          <div className="client-emails-actions">
            <button className="client-emails-btn-icon" title="Archive">
              <i className="fas fa-archive"></i>
            </button>
            <button className="client-emails-btn-icon" title="Delete">
              <i className="fas fa-trash"></i>
            </button>
            <button className="client-emails-btn-icon" title="Mark as Read">
              <i className="fas fa-envelope-open"></i>
            </button>
            <button className="client-emails-btn-icon" title="Mark as Important">
              <i className="fas fa-exclamation"></i>
            </button>
          </div>
          <div className="client-emails-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search emails..." />
          </div>
        </div>

        <div className="client-emails-items">
          {currentEmails.map(email => (
            <div key={email.id} className={`client-emails-item ${email.unread ? 'unread' : ''} ${selectedEmails.includes(email.id) ? 'selected' : ''}`}>
              <div className="client-emails-checkbox">
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(email.id)}
                  onChange={() => handleEmailSelect(email.id)}
                />
              </div>
              <div className="client-emails-sender">
                {activeTab === 'inbox' ? email.from : email.to}
              </div>
              <div className="client-emails-content-area">
                <div className="client-emails-subject">
                  {email.subject}
                  {email.important && <i className="fas fa-exclamation-circle client-emails-important-icon"></i>}
                  {email.attachments > 0 && <i className="fas fa-paperclip client-emails-attachment-icon"></i>}
                </div>
                <div className="client-emails-preview">{email.preview}</div>
              </div>
              <div className="client-emails-meta">
                <div className="client-emails-date">
                  {new Date(email.date).toLocaleDateString()}
                </div>
                {email.unread && <div className="client-emails-unread-indicator"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTemplates = () => (
    <div className="client-emails-templates-grid">
      {templates.map(template => (
        <div key={template.id} className="client-emails-template-card" onClick={() => onUseTemplate(template)}>
          <div className="client-emails-template-header">
            <div className="client-emails-template-icon">
              <i className="fas fa-layer-group"></i>
            </div>
            <div className="client-emails-template-meta">
              <span className="client-emails-template-category">{template.category}</span>
              <span className="client-emails-template-last-used">
                Used {new Date(template.lastUsed).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="client-emails-template-content">
            <h4 className="client-emails-template-name">{template.name}</h4>
            <div className="client-emails-template-subject">{template.subject}</div>
            <div className="client-emails-template-preview">{template.preview}</div>
          </div>
          <div className="client-emails-template-actions">
            <button className="client-emails-btn client-emails-btn-outline">
              <i className="fas fa-eye"></i>
              Preview
            </button>
            <button className="client-emails-btn client-emails-btn-primary">
              <i className="fas fa-envelope"></i>
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="client-emails-container">
      <div className="client-emails-header">
        <div className="client-emails-header-content">
          <button className="client-emails-btn client-emails-btn-outline" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Back to Clients
          </button>
          <div className="client-emails-header-title">
            <h1>Email Management</h1>
            <p>Manage client communications and email templates</p>
          </div>
          <div className="client-emails-header-actions">
            <button className="client-emails-btn client-emails-btn-primary" onClick={onSendEmail}>
              <i className="fas fa-pencil-alt"></i>
              Compose Email
            </button>
          </div>
        </div>
      </div>

      <div className="client-emails-content">
        <div className="client-emails-sidebar">
          <div className="client-emails-sidebar-section">
            <button className="client-emails-compose-btn" onClick={onSendEmail}>
              <i className="fas fa-pencil-alt"></i>
              Compose
            </button>
          </div>
          
          <div className="client-emails-sidebar-section">
            <h3>Folders</h3>
            {emailTabs.map(tab => (
              <button
                key={tab.id}
                className={`client-emails-sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                <span className="client-emails-tab-label">{tab.label}</span>
                <span className="client-emails-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="client-emails-sidebar-section">
            <h3>Labels</h3>
            <button className="client-emails-sidebar-tab">
              <i className="fas fa-star" style={{color: '#f59e0b'}}></i>
              <span className="client-emails-tab-label">Important</span>
              <span className="client-emails-tab-count">3</span>
            </button>
            <button className="client-emails-sidebar-tab">
              <i className="fas fa-paperclip"></i>
              <span className="client-emails-tab-label">Attachments</span>
              <span className="client-emails-tab-count">7</span>
            </button>
          </div>
        </div>

        <div className="client-emails-main">
          {activeTab === 'templates' ? renderTemplates() : renderEmailList()}
        </div>
      </div>
    </div>
  );
};

export default ClientEmails;