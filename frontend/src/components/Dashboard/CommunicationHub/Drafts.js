import React, { useState, useEffect } from 'react';
import './Drafts.css';

const Drafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);

  useEffect(() => {
    // Mock drafts data
    const mockDrafts = [
      {
        id: 1,
        to: 'foundation@example.com',
        toName: 'ABC Foundation',
        subject: 'Follow-up: Grant Application Inquiry',
        content: 'Dear Grant Committee, I am writing to follow up on our recent conversation regarding the Q4 funding cycle...',
        lastSaved: '2024-01-15T14:30:00Z',
        attachments: 1
      },
      {
        id: 2,
        to: 'partner@collab.org',
        toName: 'Community Partners Inc.',
        subject: 'Draft: Joint Grant Proposal Outline',
        content: 'Here is the draft outline for our joint grant proposal. Please review the sections and let me know your thoughts...',
        lastSaved: '2024-01-14T16:45:00Z',
        attachments: 3
      }
    ];
    setDrafts(mockDrafts);
  }, []);

  const continueEditing = (draft) => {
    // In real app, this would open the email composer with the draft content
    console.log('Continue editing:', draft);
    alert(`Opening draft: ${draft.subject}`);
  };

  const deleteDraft = (draftId) => {
    setDrafts(drafts.filter(draft => draft.id !== draftId));
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(null);
    }
  };

  return (
    <div className="drafts-container">
      <div className="drafts-header">
        <div className="drafts-title">
          <h2>
            <i className="fas fa-edit drafts-icon"></i>
            Drafts
          </h2>
          <span className="drafts-count">{drafts.length} drafts</span>
        </div>
        <div className="drafts-actions">
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i>
            New Draft
          </button>
        </div>
      </div>

      <div className="drafts-content">
        <div className="drafts-list">
          {drafts.map(draft => (
            <div 
              key={draft.id}
              className={`draft-item ${selectedDraft?.id === draft.id ? 'selected' : ''}`}
              onClick={() => setSelectedDraft(draft)}
            >
              <div className="draft-item-header">
                <div className="draft-recipient">
                  <strong>To: {draft.toName}</strong>
                </div>
                <div className="draft-date">
                  Last saved: {new Date(draft.lastSaved).toLocaleDateString()}
                </div>
              </div>
              <div className="draft-subject">
                {draft.subject}
                {draft.attachments > 0 && (
                  <span className="attachment-badge">
                    <i className="fas fa-paperclip"></i>
                    {draft.attachments}
                  </span>
                )}
              </div>
              <div className="draft-preview">
                {draft.content.substring(0, 100)}...
              </div>
              <div className="draft-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    continueEditing(draft);
                  }}
                >
                  <i className="fas fa-edit"></i>
                  Continue Editing
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDraft(draft.id);
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedDraft && (
          <div className="draft-detail">
            <div className="draft-detail-header">
              <h3>{selectedDraft.subject}</h3>
              <div className="draft-detail-meta">
                <div className="meta-item">
                  <strong>To:</strong> {selectedDraft.toName} &lt;{selectedDraft.to}&gt;
                </div>
                <div className="meta-item">
                  <strong>Last Saved:</strong> {new Date(selectedDraft.lastSaved).toLocaleString()}
                </div>
                {selectedDraft.attachments > 0 && (
                  <div className="meta-item">
                    <strong>Attachments:</strong> {selectedDraft.attachments} file(s)
                  </div>
                )}
              </div>
            </div>
            <div className="draft-detail-content">
              <p>{selectedDraft.content}</p>
            </div>
            <div className="draft-detail-actions">
              <button className="btn btn-primary">
                <i className="fas fa-edit"></i>
                Continue Editing
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-paper-plane"></i>
                Send Now
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-trash"></i>
                Delete Draft
              </button>
            </div>
          </div>
        )}

        {drafts.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-edit empty-icon"></i>
            <h3>No Drafts</h3>
            <p>You don't have any saved drafts. Start composing a new email to create one.</p>
            <button className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Compose New Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;