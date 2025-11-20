import React from 'react';
import './MeetingCard.css';

const MeetingCard = ({ 
  meeting, 
  onSelect, 
  onStart, 
  onEdit, 
  onDelete, 
  showActions = false,
  compact = false 
}) => {
  const meetingDateTime = new Date(meeting.date + 'T' + meeting.time);
  const isUpcoming = meetingDateTime > new Date();
  const isToday = meetingDateTime.toDateString() === new Date().toDateString();

  const getTimeDisplay = () => {
    if (isToday) {
      return `Today at ${meetingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return meetingDateTime.toLocaleDateString() + ' at ' + 
           meetingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = () => {
    if (meeting.status === 'completed') {
      return <span className="meeting-badge completed">Completed</span>;
    }
    if (meeting.status === 'cancelled') {
      return <span className="meeting-badge cancelled">Cancelled</span>;
    }
    if (!isUpcoming) {
      return <span className="meeting-badge missed">Missed</span>;
    }
    if (isToday) {
      return <span className="meeting-badge today">Today</span>;
    }
    return <span className="meeting-badge upcoming">Upcoming</span>;
  };

  const handleStartMeeting = (e) => {
    e.stopPropagation();
    if (onStart && isUpcoming && meeting.status !== 'cancelled') {
      onStart(meeting);
    }
  };

  const handleEditMeeting = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(meeting);
    }
  };

  const handleDeleteMeeting = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(meeting._id);
    }
  };

  if (compact) {
    return (
      <div className="meeting-card compact" onClick={() => onSelect && onSelect(meeting)}>
        <div className="meeting-card-header">
          <div className="meeting-type-indicator">
            <i className={`fas ${
              meeting.type === 'client' ? 'fa-user-tie' :
              meeting.type === 'grant' ? 'fa-file-invoice-dollar' :
              meeting.type === 'planning' ? 'fa-chart-line' :
              'fa-users'
            }`}></i>
          </div>
          <div className="meeting-info">
            <h4 className="meeting-title">{meeting.title}</h4>
            {getStatusBadge()}
          </div>
        </div>
        <div className="meeting-card-content">
          <p className="meeting-time">
            <i className="fas fa-clock"></i>
            {getTimeDisplay()}
          </p>
          <p className="meeting-duration">
            <i className="fas fa-hourglass-half"></i>
            {meeting.duration} minutes
          </p>
          {meeting.clientName && (
            <p className="meeting-client">
              <i className="fas fa-building"></i>
              {meeting.clientName}
            </p>
          )}
        </div>
        {isUpcoming && meeting.status !== 'cancelled' && onStart && (
          <div className="meeting-card-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleStartMeeting}
            >
              <i className="fas fa-video"></i>
              Start
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="meeting-card" onClick={() => onSelect && onSelect(meeting)}>
      <div className="meeting-card-header">
        <div className="meeting-type-indicator">
          <i className={`fas ${
            meeting.type === 'client' ? 'fa-user-tie' :
            meeting.type === 'grant' ? 'fa-file-invoice-dollar' :
            meeting.type === 'planning' ? 'fa-chart-line' :
            'fa-users'
          }`}></i>
        </div>
        <div className="meeting-info">
          <h4 className="meeting-title">{meeting.title}</h4>
          <p className="meeting-meta">
            <span className="meeting-time">
              <i className="fas fa-clock"></i>
              {getTimeDisplay()}
            </span>
            <span className="meeting-duration">• {meeting.duration} min</span>
            {meeting.location && (
              <span className="meeting-location">• {meeting.location}</span>
            )}
          </p>
        </div>
        <div className="meeting-status">
          {getStatusBadge()}
        </div>
      </div>

      <div className="meeting-card-content">
        {meeting.description && (
          <p className="meeting-description">{meeting.description}</p>
        )}
        
        {meeting.clientName && (
          <div className="meeting-client">
            <i className="fas fa-building"></i>
            <span>{meeting.clientName}</span>
          </div>
        )}

        {meeting.participants && meeting.participants.length > 0 && (
          <div className="meeting-participants">
            <i className="fas fa-users"></i>
            <span>{meeting.participants.length} participants</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="meeting-card-actions">
          {isUpcoming && meeting.status !== 'cancelled' && onStart && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleStartMeeting}
            >
              <i className="fas fa-video"></i>
              Start
            </button>
          )}
          
          {onEdit && (
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleEditMeeting}
            >
              <i className="fas fa-edit"></i>
              Edit
            </button>
          )}
          
          {onDelete && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleDeleteMeeting}
            >
              <i className="fas fa-trash"></i>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCard;