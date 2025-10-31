import React, { useState } from 'react';

const EmailComposer = ({ client, onSend, onCancel }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    schedule: 'now',
    trackOpens: true,
    trackClicks: true
  });

  const [templates] = useState([
    { id: 1, name: 'Grant Update', subject: 'Grant Application Update', content: 'Dear {name}, I wanted to provide an update on your grant application...' },
    { id: 2, name: 'Document Request', subject: 'Additional Documents Needed', content: 'Hi {name}, I need some additional documents to complete your grant application...' },
    { id: 3, name: 'Meeting Follow-up', subject: 'Follow-up from Our Meeting', content: 'Hello {name}, It was great speaking with you earlier. As discussed...' }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailData({
      ...emailData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTemplateSelect = (template) => {
    const personalizedContent = template.content
      .replace(/{name}/g, client.name)
      .replace(/{organization}/g, client.organization)
      .replace(/{email}/g, client.email);

    setEmailData({
      ...emailData,
      subject: template.subject,
      content: personalizedContent
    });
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    
    if (!emailData.subject || !emailData.content) {
      alert('Please fill in both subject and content.');
      return;
    }

    // Simulate sending email
    console.log('Sending email to:', client.email);
    console.log('Email data:', emailData);
    
    alert(`Email sent to ${client.name} successfully!`);
    onSend();
  };

  const handleSaveDraft = () => {
    // Save draft functionality
    alert('Draft saved successfully!');
  };

  if (!client) return null;

  return (
    <div className="email-composer-container">
      <div className="composer-header">
        <div className="header-content">
          <h1>Compose Email</h1>
          <div className="recipient-info">
            <span>To: </span>
            <strong>{client.name}</strong>
            <span className="recipient-email">&lt;{client.email}&gt;</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSendEmail}
            disabled={!emailData.subject || !emailData.content}
          >
            <i className="fas fa-paper-plane"></i>
            Send Email
          </button>
        </div>
      </div>

      <div className="composer-content">
        {/* Quick Templates */}
        <div className="templates-section">
          <h3>Quick Templates</h3>
          <div className="templates-grid">
            {templates.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-name">{template.name}</div>
                <div className="template-subject">{template.subject}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSendEmail} className="email-form">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleChange}
              required
              placeholder="Enter email subject"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Email Content *</label>
            <textarea
              id="content"
              name="content"
              value={emailData.content}
              onChange={handleChange}
              rows="12"
              required
              placeholder="Write your email content here..."
              className="email-content"
            />
          </div>

          <div className="email-options">
            <div className="option-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="trackOpens"
                  checked={emailData.trackOpens}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Track email opens
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="trackClicks"
                  checked={emailData.trackClicks}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Track link clicks
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="schedule">Schedule</label>
              <select
                id="schedule"
                name="schedule"
                value={emailData.schedule}
                onChange={handleChange}
              >
                <option value="now">Send Now</option>
                <option value="later">Schedule for Later</option>
              </select>
            </div>
          </div>

          {/* Email Preview */}
          <div className="email-preview">
            <h4>Preview</h4>
            <div className="preview-content">
              <div className="preview-header">
                <strong>To:</strong> {client.name} &lt;{client.email}&gt;
                <br />
                <strong>Subject:</strong> {emailData.subject || '(No subject)'}
              </div>
              <div className="preview-body">
                {emailData.content || 'Email content will appear here...'}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailComposer;