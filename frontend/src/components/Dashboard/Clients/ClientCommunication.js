import React, { useState } from 'react';
import './ClientCommunication.css';

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
    <div className="client-communication-panel">
      <div className="client-communication-quick-actions">
        <button className="client-communication-quick-action-btn" onClick={onSendEmail}>
          <i className="fas fa-plus"></i>
          New Email
        </button>
        <button className="client-communication-quick-action-btn">
          <i className="fas fa-inbox"></i>
          Inbox
        </button>
        <button className="client-communication-quick-action-btn">
          <i className="fas fa-paper-plane"></i>
          Sent
        </button>
      </div>
      <div className="client-communication-email-list">
        {client?.communicationHistory?.filter(c => c.type === 'email').map(email => (
          <div key={email.id} className={`client-communication-email-item ${email.status === 'unread' ? 'unread' : ''} ${email.important ? 'important' : ''}`}>
            <div className="client-communication-email-checkbox">
              <input type="checkbox" />
            </div>
            <div className="client-communication-email-sender">
              {email.direction === 'outgoing' ? 'You' : client.name}
            </div>
            <div className="client-communication-email-content">
              <div className="client-communication-email-subject">
                {email.subject}
                {email.important && <i className="fas fa-exclamation-circle" style={{color: '#dc2626'}}></i>}
              </div>
              <div className="client-communication-email-preview">{email.preview}</div>
            </div>
            <div className="client-communication-email-date">
              {new Date(email.date).toLocaleDateString()}
            </div>
            <div className="client-communication-email-actions">
              <button className="client-communication-btn-icon">
                <i className="fas fa-reply"></i>
              </button>
              <button className="client-communication-btn-icon">
                <i className="fas fa-archive"></i>
              </button>
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'email').length === 0) && (
          <div className="client-communication-no-communications">
            <i className="fas fa-envelope-open"></i>
            <h3>No emails yet</h3>
            <p>Start a conversation by sending an email to {client?.name}</p>
            <button className="client-communication-btn client-communication-btn-primary" onClick={onSendEmail}>
              <i className="fas fa-paper-plane"></i>
              Send First Email
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalls = () => (
    <div className="client-communication-panel">
      <div className="client-communication-quick-actions">
        <button className="client-communication-quick-action-btn" onClick={() => document.getElementById('client-communication-call-modal').showModal()}>
          <i className="fas fa-phone"></i>
          Log Call
        </button>
      </div>
      <div className="client-communication-call-log">
        {client?.communicationHistory?.filter(c => c.type === 'call').map(call => (
          <div key={call.id} className="client-communication-call-item">
            <div className={`client-communication-call-icon ${call.direction}`}>
              <i className={`fas fa-phone${call.direction === 'incoming' ? '-alt' : ''}`}></i>
            </div>
            <div className="client-communication-call-details">
              <div className="client-communication-call-type">
                {call.direction === 'incoming' ? 'Incoming Call' : 'Outgoing Call'}
              </div>
              <div className="client-communication-call-info">{call.notes}</div>
            </div>
            <div className="client-communication-call-duration">{call.duration}</div>
            <div className="client-communication-call-time">
              {new Date(call.date).toLocaleDateString()}
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'call').length === 0) && (
          <div className="client-communication-no-communications">
            <i className="fas fa-phone"></i>
            <h3>No calls logged</h3>
            <p>Log your first call with {client?.name}</p>
          </div>
        )}
      </div>

      {/* Call Log Modal */}
      <dialog id="client-communication-call-modal" className="client-communication-modal">
        <div className="client-communication-modal-content">
          <div className="client-communication-modal-header">
            <h3>Log Call</h3>
            <button onClick={() => document.getElementById('client-communication-call-modal').close()} className="client-communication-btn-icon">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="client-communication-modal-body">
            <div className="client-communication-form-group">
              <label>Call Type</label>
              <select 
                value={callDetails.type}
                onChange={(e) => setCallDetails({...callDetails, type: e.target.value})}
                className="client-communication-form-control"
              >
                <option value="outgoing">Outgoing Call</option>
                <option value="incoming">Incoming Call</option>
              </select>
            </div>
            <div className="client-communication-form-group">
              <label>Duration</label>
              <input
                type="text"
                placeholder="e.g., 15m, 30m"
                value={callDetails.duration}
                onChange={(e) => setCallDetails({...callDetails, duration: e.target.value})}
                className="client-communication-form-control"
              />
            </div>
            <div className="client-communication-form-group">
              <label>Call Notes</label>
              <textarea
                placeholder="Summary of the call discussion..."
                value={callDetails.notes}
                onChange={(e) => setCallDetails({...callDetails, notes: e.target.value})}
                className="client-communication-form-control"
                rows="4"
              />
            </div>
          </div>
          <div className="client-communication-modal-actions">
            <button className="client-communication-btn client-communication-btn-outline" onClick={() => document.getElementById('client-communication-call-modal').close()}>
              Cancel
            </button>
            <button className="client-communication-btn client-communication-btn-primary" onClick={handleLogCall}>
              <i className="fas fa-save"></i>
              Save Call Log
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );

  const renderMeetings = () => (
    <div className="client-communication-panel">
      <div className="client-communication-quick-actions">
        <button className="client-communication-quick-action-btn" onClick={() => document.getElementById('client-communication-meeting-modal').showModal()}>
          <i className="fas fa-plus"></i>
          Schedule Meeting
        </button>
      </div>
      <div className="client-communication-meetings-list">
        {client?.communicationHistory?.filter(c => c.type === 'meeting').map(meeting => (
          <div key={meeting.id} className="client-communication-meeting-item">
            <div className="client-communication-meeting-time">
              <div className="client-communication-meeting-date">{new Date(meeting.date).getDate()}</div>
              <div className="client-communication-meeting-month">
                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
            <div className="client-communication-meeting-details">
              <div className="client-communication-meeting-title">{meeting.title}</div>
              <div className="client-communication-meeting-description">{meeting.description}</div>
              <div className="client-communication-meeting-location">{meeting.location} • {meeting.time}</div>
            </div>
            <div className="client-communication-meeting-actions">
              <button className="client-communication-btn-icon">
                <i className="fas fa-edit"></i>
              </button>
              <button className="client-communication-btn-icon">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
        {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'meeting').length === 0) && (
          <div className="client-communication-no-communications">
            <i className="fas fa-calendar"></i>
            <h3>No meetings scheduled</h3>
            <p>Schedule your first meeting with {client?.name}</p>
          </div>
        )}
      </div>

      {/* Meeting Modal */}
      <dialog id="client-communication-meeting-modal" className="client-communication-modal">
        <div className="client-communication-modal-content">
          <div className="client-communication-modal-header">
            <h3>Schedule Meeting</h3>
            <button onClick={() => document.getElementById('client-communication-meeting-modal').close()} className="client-communication-btn-icon">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="client-communication-modal-body">
            <div className="client-communication-form-group">
              <label>Meeting Title</label>
              <input
                type="text"
                placeholder="e.g., Grant Strategy Discussion"
                value={meetingDetails.title}
                onChange={(e) => setMeetingDetails({...meetingDetails, title: e.target.value})}
                className="client-communication-form-control"
              />
            </div>
            <div className="client-communication-form-group">
              <label>Date</label>
              <input
                type="date"
                value={meetingDetails.date}
                onChange={(e) => setMeetingDetails({...meetingDetails, date: e.target.value})}
                className="client-communication-form-control"
              />
            </div>
            <div className="client-communication-form-group">
              <label>Time</label>
              <input
                type="time"
                value={meetingDetails.time}
                onChange={(e) => setMeetingDetails({...meetingDetails, time: e.target.value})}
                className="client-communication-form-control"
              />
            </div>
            <div className="client-communication-form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g., Zoom, Office, Phone"
                value={meetingDetails.location}
                onChange={(e) => setMeetingDetails({...meetingDetails, location: e.target.value})}
                className="client-communication-form-control"
              />
            </div>
            <div className="client-communication-form-group">
              <label>Description</label>
              <textarea
                placeholder="Meeting agenda and discussion points..."
                value={meetingDetails.description}
                onChange={(e) => setMeetingDetails({...meetingDetails, description: e.target.value})}
                className="client-communication-form-control"
                rows="3"
              />
            </div>
          </div>
          <div className="client-communication-modal-actions">
            <button className="client-communication-btn client-communication-btn-outline" onClick={() => document.getElementById('client-communication-meeting-modal').close()}>
              Cancel
            </button>
            <button className="client-communication-btn client-communication-btn-primary" onClick={handleScheduleMeeting}>
              <i className="fas fa-calendar-plus"></i>
              Schedule Meeting
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );

  const renderNotes = () => (
    <div className="client-communication-panel">
      <div className="client-communication-notes-container">
        <div className="client-communication-note-editor">
          <div className="client-communication-note-toolbar">
            <button className="client-communication-btn-icon">
              <i className="fas fa-bold"></i>
            </button>
            <button className="client-communication-btn-icon">
              <i className="fas fa-italic"></i>
            </button>
            <button className="client-communication-btn-icon">
              <i className="fas fa-list-ul"></i>
            </button>
          </div>
          <textarea
            className="client-communication-note-textarea"
            placeholder="Add a note about your conversation with this client..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="client-communication-note-actions">
            <button className="client-communication-btn client-communication-btn-outline" onClick={() => setNewNote('')}>
              Clear
            </button>
            <button className="client-communication-btn client-communication-btn-primary" onClick={handleAddNote}>
              <i className="fas fa-save"></i>
              Save Note
            </button>
          </div>
        </div>

        <div className="client-communication-notes-list">
          {client?.communicationHistory?.filter(c => c.type === 'note').map(note => (
            <div key={note.id} className="client-communication-note-item">
              <div className="client-communication-note-content">{note.content}</div>
              <div className="client-communication-note-meta">
                <span>{new Date(note.date).toLocaleString()}</span>
                <div className="client-communication-note-actions-small">
                  <button className="client-communication-btn-icon">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="client-communication-btn-icon">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!client?.communicationHistory || client.communicationHistory.filter(c => c.type === 'note').length === 0) && (
            <div className="client-communication-no-communications">
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
    <div className="client-communication-container">
      <div className="client-communication-header">
        <div className="client-communication-header-content">
          <button className="client-communication-btn client-communication-btn-outline" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Back to Clients
          </button>
          <div className="client-communication-info">
            <img src={client?.avatar} alt={client?.name} className="client-communication-avatar" />
            <div className="client-communication-details">
              <h2>{client?.name}</h2>
              <p>{client?.organization} • {client?.email}</p>
            </div>
          </div>
          <div className="client-communication-header-actions">
            <button className="client-communication-btn client-communication-btn-primary" onClick={onSendEmail}>
              <i className="fas fa-paper-plane"></i>
              Send Email
            </button>
          </div>
        </div>
      </div>

      <div className="client-communication-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`client-communication-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
            <span className="client-communication-tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="client-communication-content">
        {activeTab === 'emails' && renderEmails()}
        {activeTab === 'calls' && renderCalls()}
        {activeTab === 'meetings' && renderMeetings()}
        {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
};

export default ClientCommunication;