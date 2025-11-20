import React from 'react';
import './MeetingDetails.css';

const MeetingDetails = ({ meeting, onClose, onStartMeeting, onEdit, onDelete }) => {
  if (!meeting) {
    return (
      <div className="meeting-details-overlay">
        <div className="meeting-details-modal">
          <div className="meeting-details-header">
            <h2>No Meeting Selected</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="meeting-details-content">
            <p>Please select a meeting to view details.</p>
          </div>
          <div className="meeting-details-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meetingDateTime = new Date(meeting.date + 'T' + meeting.time);
  const isUpcoming = meetingDateTime > new Date();
  const isToday = meetingDateTime.toDateString() === new Date().toDateString();

  const getMeetingStatus = () => {
    if (meeting.status === 'completed') return 'completed';
    if (meeting.status === 'cancelled') return 'cancelled';
    if (meetingDateTime < new Date()) return 'missed';
    if (isToday) return 'today';
    return 'upcoming';
  };

  const handleJoinMeeting = () => {
    if (isUpcoming && meeting.status !== 'cancelled') {
      onStartMeeting(meeting);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'cancelled': return '#6c757d';
      case 'missed': return '#dc3545';
      case 'today': return '#fd7e14';
      case 'upcoming': return '#007bff';
      default: return '#6c757d';
    }
  };

  return (
    <div className="meeting-details-overlay">
      <div className="meeting-details-modal">
        <div className="meeting-details-header">
          <h2>{meeting.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="meeting-details-content">
          <div className="meeting-info-grid">
            <div className="meeting-info-item">
              <label>Date & Time</label>
              <p>
                {meetingDateTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {' '}
                {meetingDateTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            <div className="meeting-info-item">
              <label>Duration</label>
              <p>{meeting.duration} minutes</p>
            </div>

            <div className="meeting-info-item">
              <label>Type</label>
              <p className={`meeting-type ${meeting.type}`}>
                <i className={`fas ${
                  meeting.type === 'client' ? 'fa-user-tie' :
                  meeting.type === 'grant' ? 'fa-file-invoice-dollar' :
                  meeting.type === 'planning' ? 'fa-chart-line' :
                  'fa-users'
                }`}></i>
                {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Meeting
              </p>
            </div>

            <div className="meeting-info-item">
              <label>Status</label>
              <p className="meeting-status" style={{ color: getStatusColor(getMeetingStatus()) }}>
                <span className="status-dot" style={{ backgroundColor: getStatusColor(getMeetingStatus()) }}></span>
                {getMeetingStatus().charAt(0).toUpperCase() + getMeetingStatus().slice(1)}
              </p>
            </div>

            <div className="meeting-info-item">
              <label>Location</label>
              <p>
                <i className={`fas ${
                  meeting.location === 'virtual' ? 'fa-video' :
                  meeting.location === 'office' ? 'fa-building' :
                  'fa-map-marker-alt'
                }`}></i>
                {meeting.location === 'virtual' ? 'Virtual Meeting' :
                 meeting.location === 'office' ? 'Office' :
                 meeting.location === 'client-site' ? 'Client Site' : 'Other'}
              </p>
            </div>

            {meeting.clientName && (
              <div className="meeting-info-item">
                <label>Client</label>
                <p>
                  <i className="fas fa-building"></i>
                  {meeting.clientName}
                </p>
              </div>
            )}

            {meeting.participants && meeting.participants.length > 0 && (
              <div className="meeting-info-item full-width">
                <label>Participants ({meeting.participants.length})</label>
                <div className="participants-list">
                  {meeting.participants.map((participant, index) => (
                    <span key={index} className="participant-tag">
                      <i className="fas fa-user"></i>
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {meeting.description && (
            <div className="meeting-description">
              <label>Description</label>
              <p>{meeting.description}</p>
            </div>
          )}

          {meeting.agenda && meeting.agenda.length > 0 && (
            <div className="meeting-agenda">
              <label>Agenda</label>
              <ul>
                {meeting.agenda.map((item, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meeting.notes && (
            <div className="meeting-notes">
              <label>Additional Notes</label>
              <p>{meeting.notes}</p>
            </div>
          )}
        </div>

        <div className="meeting-details-actions">
          {isUpcoming && meeting.status !== 'cancelled' && (
            <button className="btn btn-primary" onClick={handleJoinMeeting}>
              <i className="fas fa-video"></i>
              Start Meeting
            </button>
          )}
          
          {meeting.status !== 'completed' && meeting.status !== 'cancelled' && (
            <button className="btn btn-outline" onClick={onEdit}>
              <i className="fas fa-edit"></i>
              Edit Meeting
            </button>
          )}
          
          <button className="btn btn-danger" onClick={onDelete}>
            <i className="fas fa-trash"></i>
            {meeting.status === 'cancelled' ? 'Delete Meeting' : 'Cancel Meeting'}
          </button>
          
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;