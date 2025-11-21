// frontend/src/components/Dashboard/AIWriting/ContentEditor.js
import React, { useState } from 'react';
import './ContentEditor.css'; // Import the standalone CSS

const ContentEditor = ({ clients, grants, selectedClient, selectedGrant, onSelectClient, onSelectGrant }) => {
  const [content, setContent] = useState('');
  const [savedVersions, setSavedVersions] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim() ? newContent.trim().split(/\s+/).length : 0);
    setCharacterCount(newContent.length);
  };

  const handleSaveVersion = () => {
    if (!content.trim()) {
      alert('No content to save.');
      return;
    }

    const newVersion = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toLocaleString(),
      wordCount: wordCount,
      characterCount: characterCount
    };

    setSavedVersions(prev => [newVersion, ...prev]);
    alert('Version saved successfully!');
  };

  const handleLoadVersion = (version) => {
    setContent(version.content);
  };

  const handleExport = (format) => {
    if (!content.trim()) {
      alert('No content to export.');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grant-content-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-editor">
      <div className="editor-header">
        <h2>Grant Content Editor</h2>
        <div className="editor-stats">
          <span className="stat">{wordCount} words</span>
          <span className="stat">{characterCount} characters</span>
        </div>
      </div>

      <div className="editor-layout">
        {/* Project Info Sidebar */}
        <div className="editor-sidebar">
          <div className="project-info">
            <h3>Project Information</h3>
            
            <div className="form-group">
              <label>Client</label>
              <select 
                value={selectedClient?.id || ''} 
                onChange={(e) => onSelectClient(clients.find(c => c.id === e.target.value))}
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Grant</label>
              <select 
                value={selectedGrant?.id || ''} 
                onChange={(e) => onSelectGrant(grants.find(g => g.id === e.target.value))}
                disabled={!selectedClient}
              >
                <option value="">Select Grant</option>
                {grants
                  .filter(grant => grant.clientId === selectedClient?.id)
                  .map(grant => (
                    <option key={grant.id} value={grant.id}>
                      {grant.title}
                    </option>
                  ))
                }
              </select>
            </div>

            {selectedGrant && (
              <div className="grant-details">
                <h4>Grant Details</h4>
                <div className="detail-item">
                  <strong>Status:</strong> {selectedGrant.status}
                </div>
                <div className="detail-item">
                  <strong>Deadline:</strong> {selectedGrant.deadline}
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="version-history">
            <h3>Version History</h3>
            <div className="versions-list">
              {savedVersions.map(version => (
                <div key={version.id} className="version-item">
                  <div className="version-header">
                    <span className="version-time">{version.timestamp}</span>
                    <span className="version-stats">{version.wordCount} words</span>
                  </div>
                  <div className="version-actions">
                    <button 
                      className="btn-link"
                      onClick={() => handleLoadVersion(version)}
                    >
                      <i className="fas fa-redo"></i>
                      Restore
                    </button>
                  </div>
                </div>
              ))}

              {savedVersions.length === 0 && (
                <div className="no-versions">
                  <i className="fas fa-history"></i>
                  <p>No saved versions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="editor-main">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <button className="btn btn-outline">
                <i className="fas fa-bold"></i>
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-italic"></i>
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-underline"></i>
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-list-ul"></i>
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-list-ol"></i>
              </button>
            </div>
            
            <div className="toolbar-right">
              <button 
                className="btn btn-outline"
                onClick={handleSaveVersion}
              >
                <i className="fas fa-save"></i>
                Save Version
              </button>
              <div className="export-dropdown">
                <button className="btn btn-primary">
                  <i className="fas fa-download"></i>
                  Export
                </button>
                <div className="dropdown-menu">
                  <button onClick={() => handleExport('txt')}>Export as TXT</button>
                  <button onClick={() => handleExport('doc')}>Export as DOC</button>
                  <button onClick={() => handleExport('pdf')}>Export as PDF</button>
                </div>
              </div>
            </div>
          </div>

          <div className="editor-area">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your grant content here... You can paste AI-generated content or write directly."
              className="content-textarea"
            />
          </div>

          {/* Writing Tips */}
          <div className="writing-tips">
            <h4>Writing Tips</h4>
            <div className="tips-list">
              <div className="tip">
                <i className="fas fa-lightbulb"></i>
                <span>Use active voice and strong verbs</span>
              </div>
              <div className="tip">
                <i className="fas fa-lightbulb"></i>
                <span>Include specific data and statistics</span>
              </div>
              <div className="tip">
                <i className="fas fa-lightbulb"></i>
                <span>Focus on outcomes and impact</span>
              </div>
              <div className="tip">
                <i className="fas fa-lightbulb"></i>
                <span>Align with funder priorities</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;