import React, { useState } from 'react';

const ReportSharing = ({ report }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [shareSettings, setShareSettings] = useState({
    canEdit: false,
    canComment: true,
    canView: true,
    expiryDate: ''
  });

  const handleAddCollaborator = () => {
    if (newCollaborator && !collaborators.includes(newCollaborator)) {
      setCollaborators(prev => [...prev, {
        email: newCollaborator,
        role: 'viewer',
        addedAt: new Date().toISOString()
      }]);
      setNewCollaborator('');
    }
  };

  const handleRemoveCollaborator = (email) => {
    setCollaborators(prev => prev.filter(c => c.email !== email));
  };

  const updateCollaboratorRole = (email, newRole) => {
    setCollaborators(prev => 
      prev.map(c => c.email === email ? { ...c, role: newRole } : c)
    );
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/report/${report.id}`;
  };

  const [shareLink] = useState(generateShareLink());

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="report-sharing">
      <div className="sharing-header">
        <h2>Share & Collaborate</h2>
        <p>Manage access and collaboration for: <strong>{report.title}</strong></p>
      </div>

      <div className="sharing-options">
        <div className="sharing-card">
          <h3>🔗 Shareable Link</h3>
          <div className="share-link-section">
            <div className="link-display">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="link-input"
              />
              <button className="primary-button" onClick={copyToClipboard}>
                Copy Link
              </button>
            </div>
            <div className="link-settings">
              <label>
                <input
                  type="checkbox"
                  checked={shareSettings.canView}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    canView: e.target.checked
                  }))}
                />
                Allow viewing
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={shareSettings.canComment}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    canComment: e.target.checked
                  }))}
                />
                Allow comments
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={shareSettings.canEdit}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    canEdit: e.target.checked
                  }))}
                />
                Allow editing
              </label>
            </div>
          </div>
        </div>

        <div className="sharing-card">
          <h3>👥 Add Collaborators</h3>
          <div className="add-collaborator">
            <input
              type="email"
              value={newCollaborator}
              onChange={(e) => setNewCollaborator(e.target.value)}
              placeholder="Enter email address..."
              className="email-input"
            />
            <button 
              className="primary-button"
              onClick={handleAddCollaborator}
              disabled={!newCollaborator}
            >
              Add Collaborator
            </button>
          </div>

          <div className="collaborators-list">
            <h4>Current Collaborators</h4>
            {collaborators.length === 0 ? (
              <p className="no-collaborators">No collaborators added yet</p>
            ) : (
              collaborators.map(collaborator => (
                <div key={collaborator.email} className="collaborator-item">
                  <div className="collaborator-info">
                    <span className="collaborator-email">{collaborator.email}</span>
                    <span className="added-date">
                      Added: {new Date(collaborator.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="collaborator-actions">
                    <select
                      value={collaborator.role}
                      onChange={(e) => updateCollaboratorRole(collaborator.email, e.target.value)}
                      className="role-select"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                    </select>
                    
                    <button
                      className="icon-button danger"
                      onClick={() => handleRemoveCollaborator(collaborator.email)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sharing-card">
          <h3>📤 Export Options</h3>
          <div className="export-options">
            <button className="export-button">
              📄 Export as PDF
            </button>
            <button className="export-button">
              📊 Export as PowerPoint
            </button>
            <button className="export-button">
              📝 Export as Word Document
            </button>
            <button className="export-button">
              📋 Export as Markdown
            </button>
          </div>
        </div>
      </div>

      <div className="sharing-notes">
        <h4>💡 Sharing Notes</h4>
        <ul>
          <li>Viewers can only read the report</li>
          <li>Commenters can read and add comments</li>
          <li>Editors can modify content and settings</li>
          <li>Share links expire after 30 days by default</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportSharing;