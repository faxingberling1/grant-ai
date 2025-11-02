import React, { useState } from 'react';

const CommunicationHistory = ({ client, onBack, onSendEmail }) => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filters = [
    { id: 'all', label: 'All Communications' },
    { id: 'emails', label: 'Emails' },
    { id: 'calls', label: 'Calls' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'notes', label: 'Notes' }
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'email': return 'fas fa-envelope';
      case 'call': return 'fas fa-phone';
      case 'meeting': return 'fas fa-calendar';
      case 'note': return 'fas fa-sticky-note';
      default: return 'fas fa-comment';
    }
  };

  const getCommunicationColor = (type) => {
    switch (type) {
      case 'email': return '#3b82f6';
      case 'call': return '#10b981';
      case 'meeting': return '#f59e0b';
      case 'note': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const filteredCommunications = client?.communicationHistory?.filter(comm => {
    if (filter !== 'all' && comm.type !== filter) return false;
    
    const commDate = new Date(comm.date);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return commDate.toDateString() === now.toDateString();
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return commDate >= weekStart;
      case 'month':
        return commDate.getMonth() === now.getMonth() && commDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  }) || [];

  const groupCommunicationsByDate = (comms) => {
    const groups = {};
    comms.forEach(comm => {
      const date = new Date(comm.date).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(comm);
    });
    return groups;
  };

  const groupedCommunications = groupCommunicationsByDate(filteredCommunications);

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
            <h2>Communication History</h2>
            <p>All interactions with {client?.name}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onSendEmail}>
            <i className="fas fa-paper-plane"></i>
            New Communication
          </button>
        </div>
      </div>

      <div className="communication-stats">
        <div className="stat-item">
          <div className="stat-value">{client?.communicationHistory?.length || 0}</div>
          <div className="stat-label">Total Interactions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {client?.communicationHistory?.filter(c => c.type === 'email').length || 0}
          </div>
          <div className="stat-label">Emails</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {client?.communicationHistory?.filter(c => c.type === 'call').length || 0}
          </div>
          <div className="stat-label">Calls</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {client?.communicationHistory?.filter(c => c.type === 'meeting').length || 0}
          </div>
          <div className="stat-label">Meetings</div>
        </div>
      </div>

      <div className="communication-content">
        <div className="communication-panel">
          <div className="quick-actions">
            <div className="filters">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                {filters.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="filter-select"
              >
                {dateRanges.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="communication-timeline">
            {Object.keys(groupedCommunications).length > 0 ? (
              Object.entries(groupedCommunications).map(([date, comms]) => (
                <div key={date} className="timeline-day">
                  <div className="timeline-date">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="timeline-events">
                    {comms.map(comm => (
                      <div key={comm.id} className="timeline-event">
                        <div 
                          className="timeline-icon"
                          style={{ backgroundColor: getCommunicationColor(comm.type) }}
                        >
                          <i className={getCommunicationIcon(comm.type)}></i>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <div className="timeline-title">
                              {comm.type === 'email' && comm.subject}
                              {comm.type === 'call' && `${comm.direction === 'incoming' ? 'Incoming' : 'Outgoing'} Call`}
                              {comm.type === 'meeting' && comm.title}
                              {comm.type === 'note' && 'Note Added'}
                            </div>
                            <div className="timeline-time">
                              {new Date(comm.date).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="timeline-body">
                            {comm.type === 'email' && (
                              <div className="email-preview">{comm.preview}</div>
                            )}
                            {comm.type === 'call' && (
                              <div className="call-notes">
                                <div className="call-duration">Duration: {comm.duration}</div>
                                <div>{comm.notes}</div>
                              </div>
                            )}
                            {comm.type === 'meeting' && (
                              <div className="meeting-details">
                                <div>{comm.location} • {comm.time}</div>
                                <div>{comm.description}</div>
                              </div>
                            )}
                            {comm.type === 'note' && (
                              <div className="note-content">{comm.content}</div>
                            )}
                          </div>
                          {comm.important && (
                            <div className="timeline-important">
                              <i className="fas fa-exclamation-circle"></i>
                              Important
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-communications">
                <i className="fas fa-history"></i>
                <h3>No communication history</h3>
                <p>Start communicating with {client?.name} to see history here</p>
                <button className="btn btn-primary" onClick={onSendEmail}>
                  <i className="fas fa-paper-plane"></i>
                  Send First Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHistory;