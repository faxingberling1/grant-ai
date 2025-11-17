import React, { useState, useEffect } from 'react';
import './Trash.css';

const Trash = () => {
  const [trashEmails, setTrashEmails] = useState([]);

  useEffect(() => {
    // Mock trash emails data
    const mockTrashEmails = [
      {
        id: 1,
        from: 'newsletter@example.com',
        fromName: 'Grant Writing Tips',
        subject: 'Weekly Newsletter - Writing Effective Proposals',
        preview: 'This week we cover tips for writing compelling grant proposals that stand out...',
        date: '2024-01-10T12:00:00Z',
        deletedDate: '2024-01-14T10:30:00Z'
      },
      {
        id: 2,
        from: 'promo@example.com',
        fromName: 'Grant Software Tools',
        subject: 'Special Offer - Grant Management Software',
        preview: 'Limited time offer on our premium grant management software. Save 50% this month...',
        date: '2024-01-08T14:20:00Z',
        deletedDate: '2024-01-13T15:45:00Z'
      }
    ];
    setTrashEmails(mockTrashEmails);
  }, []);

  const restoreEmail = (emailId) => {
    setTrashEmails(trashEmails.filter(email => email.id !== emailId));
    // In real app, this would restore the email to its original folder
  };

  const deletePermanently = (emailId) => {
    setTrashEmails(trashEmails.filter(email => email.id !== emailId));
    // In real app, this would permanently delete the email
  };

  const emptyTrash = () => {
    setTrashEmails([]);
    // In real app, this would empty the trash folder
  };

  return (
    <div className="trash-container">
      <div className="trash-header">
        <div className="trash-title">
          <h2>
            <i className="fas fa-trash trash-icon"></i>
            Trash
          </h2>
          <span className="trash-count">{trashEmails.length} items</span>
        </div>
        <div className="trash-actions">
          <button 
            className="btn btn-outline"
            onClick={emptyTrash}
            disabled={trashEmails.length === 0}
          >
            <i className="fas fa-broom"></i>
            Empty Trash
          </button>
        </div>
      </div>

      <div className="trash-content">
        {trashEmails.length > 0 ? (
          <div className="trash-list">
            {trashEmails.map(email => (
              <div key={email.id} className="trash-item">
                <div className="trash-item-header">
                  <div className="trash-sender">
                    <strong>{email.fromName}</strong>
                    <span>&lt;{email.from}&gt;</span>
                  </div>
                  <div className="trash-dates">
                    <span className="deleted-date">
                      Deleted: {new Date(email.deletedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="trash-subject">
                  {email.subject}
                </div>
                <div className="trash-preview">
                  {email.preview}
                </div>
                <div className="trash-item-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => restoreEmail(email.id)}
                  >
                    <i className="fas fa-undo"></i>
                    Restore
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => deletePermanently(email.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-trash empty-icon"></i>
            <h3>Trash is Empty</h3>
            <p>Deleted emails will appear here. They will be automatically permanently deleted after 30 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;