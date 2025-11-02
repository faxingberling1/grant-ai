import React, { useState } from 'react';

const ClientCommunication = ({ client, onSendEmail, onAddCommunication, onBack, activeTab, onTabChange }) => {
  const [newNote, setNewNote] = useState('');
  const [callDetails, setCallDetails] = useState({
    type: 'outgoing',
    duration: '',
    notes: ''
  });
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const tabs = [
    { id: 'emails', label: 'Emails', icon: 'fas fa-envelope', count: client?.communicationHistory?.filter(c => c.type === 'email').length || 0 },
    { id: 'calls', label: 'Calls', icon: 'fas fa-phone', count: client?.communicationHistory?.filter(c => c.type === 'call').length || 0 },
    { id: 'meetings', label: 'Meetings', icon: 'fas fa-calendar', count: client?.communicationHistory?.filter(c => c.type === 'meeting').length || 0 },
    { id: 'notes', label: 'Notes', icon: 'fas fa-sticky-note', count: client?.communicationHistory?.filter(c => c.type === 'note').length || 0 }
  ];

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddCommunication({
        type: 'note',
        content: newNote,
        important: false
      });
      setNewNote('');
    }
  };

  const handleLogCall = () => {
    if (callDetails.duration.trim() && callDetails.notes.trim()) {
      onAddCommunication({
        type: 'call',
        direction: callDetails.type,
        duration: callDetails.duration,
        notes: callDetails.notes,
        important: false
      });
      setCallDetails({ type: 'outgoing', duration: '', notes: '' });
    }
  };

  const handleScheduleMeeting = () => {
    if (meetingDetails.title.trim() && meetingDetails.date) {
      onAddCommunication({
        type: 'meeting',
        title: meetingDetails.title,
        date: meetingDetails.date,
        time: meetingDetails.time,
        location: meetingDetails.location,
        description: meetingDetails.description,
        important: false
      });
      setMeetingDetails({ title: '', date: '', time: '', location: '', description: '' });
    }
  };

  const renderEmails = () => (
    <div className="communication-panel">
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={onSendEmail}>
          <i className="fas fa-plus"></i>
          New Email
        </button>
        <button className="quick-action-btn">
          <i className="fas fa-inbox"></i>
          Inbox
        </button>
        <button className="quick-action-btn">
          <i className="fas fa-paper-plane"></i>
          Sent
        </button>
      </div>
      <div className="email-list">
        {client?.communicationHistory?.filter(c => c.type === 'email').map(email => (
          <div key={email.id} className={`email-item ${email.status === 'unread' ? 'unread' : ''} ${email.important ? 'important' : ''}`}>
            <div className="email-checkbox">
              <input type="checkbox" />
            </div>
            <div className="email-sender">
              {email.direction === 'outgoing' ? 'You' : client.name}
            </div>
            <div className="email-content">
              <div className="email-subject">
                {email.subject}
                {email.important && <i className="fas fa-exclamation-circle" style={{color: '#dc2626'}}></i>}
              </div>
              <div className="email-preview">{email.preview}</div>
            </div>
            <div className="email-date">
              {new Date(email.date).toLocaleDateString()}
            </div>
            <div className="email-actions">
              <button className="btn-icon">
                <i className="fas fa-reply"></i>
              </button>
              <button className="btn-icon">
                <i className="fas fa-archive"></i>
              </button>
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'email').length === 0) && (
          <div className="no-communications">
            <i className="fas fa-envelope-open"></i>
            <h3>No emails yet</h3>
            <p>Start a conversation by sending an email to {client?.name}</p>
            <button className="btn btn-primary" onClick={onSendEmail}>
              <i className="fas fa-paper-plane"></i>
              Send First Email
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalls = () => (
    <div className="communication-panel">
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => document.getElementById('call-modal').showModal()}>
          <i className="fas fa-phone"></i>
          Log Call
        </button>
      </div>
      <div className="call-log">
        {client?.communicationHistory?.filter(c => c.type === 'call').map(call => (
          <div key={call.id} className="call-item">
            <div className={`call-icon ${call.direction}`}>
              <i className={`fas fa-phone${call.direction === 'incoming' ? '-alt' : ''}`}></i>
            </div>
            <div className="call-details">
              <div className="call-type">
                {call.direction === 'incoming' ? 'Incoming Call' : 'Outgoing Call'}
              </div>
              <div className="call-info">{call.notes}</div>
            </div>
            <div className="call-duration">{call.duration}</div>
            <div className="call-time">
              {new Date(call.date).toLocaleDateString()}
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'call').length === 0) && (
          <div className="no-communications">
            <i className="fas fa-phone"></i>
            <h3>No calls logged</h3>
            <p>Log your first call with {client?.name}</p>
          </div>
        )}
      </div>

      {/* Call Log Modal */}
      <dialog id="call-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Log Call</h3>
            <button onClick={() => document.getElementById('call-modal').close()} className="btn-icon">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Call Type</label>
              <select 
                value={callDetails.type}
                onChange={(e) => setCallDetails({...callDetails, type: e.target.value})}
                className="form-control"
              >
                <option value="outgoing">Outgoing Call</option>
                <option value="incoming">Incoming Call</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                placeholder="e.g., 15m, 30m"
                value={callDetails.duration}
                onChange={(e) => setCallDetails({...callDetails, duration: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Call Notes</label>
              <textarea
                placeholder="Summary of the call discussion..."
                value={callDetails.notes}
                onChange={(e) => setCallDetails({...callDetails, notes: e.target.value})}
                className="form-control"
                rows="4"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => document.getElementById('call-modal').close()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleLogCall}>
              <i className="fas fa-save"></i>
              Save Call Log
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );

  const renderMeetings = () => (
    <div className="communication-panel">
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => document.getElementById('meeting-modal').showModal()}>
          <i className="fas fa-plus"></i>
          Schedule Meeting
        </button>
      </div>
      <div className="meetings-list">
        {client?.communicationHistory?.filter(c => c.type === 'meeting').map(meeting => (
          <div key={meeting.id} className="meeting-item">
            <div className="meeting-time">
              <div className="meeting-date">{new Date(meeting.date).getDate()}</div>
              <div className="meeting-month">
                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
            <div className="meeting-details">
              <div className="meeting-title">{meeting.title}</div>
              <div className="meeting-description">{meeting.description}</div>
              <div className="meeting-location">{meeting.location} • {meeting.time}</div>
            </div>
            <div className="meeting-actions">
              <button className="btn-icon">
                <i className="fas fa-edit"></i>
              </button>
              <button className="btn-icon">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'meeting').length === 0) && (
          <div className="no-communications">
            <i className="fas fa-calendar"></i>
            <h3>No meetings scheduled</h3>
            <p>Schedule your first meeting with {client?.name}</p>
          </div>
        )}
      </div>

      {/* Meeting Modal */}
      <dialog id="meeting-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Schedule Meeting</h3>
            <button onClick={() => document.getElementById('meeting-modal').close()} className="btn-icon">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Meeting Title</label>
              <input
                type="text"
                placeholder="e.g., Grant Strategy Discussion"
                value={meetingDetails.title}
                onChange={(e) => setMeetingDetails({...meetingDetails, title: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={meetingDetails.date}
                onChange={(e) => setMeetingDetails({...meetingDetails, date: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={meetingDetails.time}
                onChange={(e) => setMeetingDetails({...meetingDetails, time: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g., Zoom, Office, Phone"
                value={meetingDetails.location}
                onChange={(e) => setMeetingDetails({...meetingDetails, location: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Meeting agenda and discussion points..."
                value={meetingDetails.description}
                onChange={(e) => setMeetingDetails({...meetingDetails, description: e.target.value})}
                className="form-control"
                rows="3"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => document.getElementById('meeting-modal').close()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleScheduleMeeting}>
              <i className="fas fa-calendar-plus"></i>
              Schedule Meeting
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );

  const renderNotes = () => (
    <div className="communication-panel">
      <div className="notes-container">
        <div className="note-editor">
          <div className="note-toolbar">
            <button className="btn-icon">
              <i className="fas fa-bold"></i>
            </button>
            <button className="btn-icon">
              <i className="fas fa-italic"></i>
            </button>
            <button className="btn-icon">
              <i className="fas fa-list-ul"></i>
            </button>
          </div>
          <textarea
            className="note-textarea"
            placeholder="Add a note about your conversation with this client..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="note-actions">
            <button className="btn btn-outline" onClick={() => setNewNote('')}>
              Clear
            </button>
            <button className="btn btn-primary" onClick={handleAddNote}>
              <i className="fas fa-save"></i>
              Save Note
            </button>
          </div>
        </div>

        <div className="notes-list">
          {client?.communicationHistory?.filter(c => c.type === 'note').map(note => (
            <div key={note.id} className="note-item">
              <div className="note-content">{note.content}</div>
              <div className="note-meta">
                <span>{new Date(note.date).toLocaleString()}</span>
                <div className="note-actions-small">
                  <button className="btn-icon">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn-icon">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'note').length === 0) && (
            <div className="no-communications">
              <i className="fas fa-sticky-note"></i>
              <h3>No notes yet</h3>
              <p>Add your first note about {client?.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="clients-list">
      <div className="communication-header">
        <button className="btn btn-outline" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Clients
        </button>
        <div className="client-communication-info">
          <img src={client?.avatar} alt={client?.name} className="communication-client-avatar" />
          <div className="communication-client-details">
            <h2>{client?.name}</h2>
            <p>{client?.organization} • {client?.email}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onSendEmail}>
            <i className="fas fa-paper-plane"></i>
            Send Email
          </button>
        </div>
      </div>

      <div className="communication-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`communication-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
            <span className="tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="communication-content">
        {activeTab === 'emails' && renderEmails()}
        {activeTab === 'calls' && renderCalls()}
        {activeTab === 'meetings' && renderMeetings()}
        {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
};

export default ClientCommunication;