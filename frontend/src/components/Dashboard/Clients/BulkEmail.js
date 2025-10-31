import React, { useState } from 'react';

const BulkEmail = ({ clients, onSend, onCancel }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    selectedClients: clients.map(client => client.id),
    schedule: 'now'
  });

  const [templates, setTemplates] = useState([
    { id: 1, name: 'Grant Update', subject: 'Grant Application Update', content: 'Dear {name}, I wanted to provide an update on your grant application...' },
    { id: 2, name: 'New Opportunity', subject: 'New Grant Opportunity Available', content: 'Hi {name}, I found a new grant opportunity that aligns perfectly with your organization...' },
    { id: 3, name: 'Meeting Request', subject: 'Follow-up Meeting Request', content: 'Hello {name}, I\'d like to schedule a follow-up meeting to discuss...' }
  ]);

  const handleChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handleClientSelection = (clientId) => {
    const updatedSelection = emailData.selectedClients.includes(clientId)
      ? emailData.selectedClients.filter(id => id !== clientId)
      : [...emailData.selectedClients, clientId];
    
    setEmailData({
      ...emailData,
      selectedClients: updatedSelection
    });
  };

  const handleSelectAll = () => {
    setEmailData({
      ...emailData,
      selectedClients: clients.map(client => client.id)
    });
  };

  const handleSelectNone = () => {
    setEmailData({
      ...emailData,
      selectedClients: []
    });
  };

  const handleTemplateSelect = (template) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      content: template.content
    });
  };

  const handleSendBulkEmail = (e) => {
    e.preventDefault();
    
    const selectedClientCount = emailData.selectedClients.length;
    if (selectedClientCount === 0) {
      alert('Please select at least one client.');
      return;
    }

    if (!emailData.subject || !emailData.content) {
      alert('Please fill in both subject and content.');
      return;
    }

    // Simulate sending bulk email
    console.log('Sending bulk email to:', selectedClientCount, 'clients');
    console.log('Email data:', emailData);
    
    alert(`Bulk email sent to ${selectedClientCount} clients successfully!`);
    onSend();
  };

  const selectedCount = emailData.selectedClients.length;
  const totalCount = clients.length;

  return (
    <div className="bulk-email-container">
      <div className="bulk-email-header">
        <h1>Send Bulk Email</h1>
        <p>Send email to multiple clients at once</p>
      </div>

      <div className="bulk-email-content">
        <div className="email-composer">
          <form onSubmit={handleSendBulkEmail}>
            {/* Template Selection */}
            <div className="template-section">
              <h3>Email Templates</h3>
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

            {/* Email Composition */}
            <div className="composition-section">
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
                  rows="8"
                  required
                  placeholder="Write your email content here. Use {name} for personalization."
                />
                <div className="content-tips">
                  <p><strong>Personalization tips:</strong></p>
                  <ul>
                    <li>Use <code>{'{name}'}</code> for client's name</li>
                    <li>Use <code>{'{organization}'}</code> for organization name</li>
                    <li>Use <code>{'{email}'}</code> for client's email</li>
                  </ul>
                </div>
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

            {/* Client Selection */}
            <div className="clients-selection">
              <div className="selection-header">
                <h3>Select Clients</h3>
                <div className="selection-actions">
                  <span className="selection-count">
                    {selectedCount} of {totalCount} selected
                  </span>
                  <button type="button" className="btn-link" onClick={handleSelectAll}>
                    Select All
                  </button>
                  <button type="button" className="btn-link" onClick={handleSelectNone}>
                    Select None
                  </button>
                </div>
              </div>

              <div className="clients-list-selection">
                {clients.map(client => (
                  <div key={client.id} className="client-selection-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={emailData.selectedClients.includes(client.id)}
                        onChange={() => handleClientSelection(client.id)}
                      />
                      <span className="checkmark"></span>
                      <div className="client-info">
                        <div className="client-name">{client.name}</div>
                        <div className="client-organization">{client.organization}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bulk-email-actions">
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i>
                Send to {selectedCount} Clients
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkEmail;