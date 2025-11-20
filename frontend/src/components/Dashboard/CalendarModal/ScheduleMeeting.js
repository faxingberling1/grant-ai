import React, { useState, useEffect } from 'react';
import './ScheduleMeeting.css';

const ScheduleMeeting = ({ clients, meeting, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'client',
    clientId: '',
    participants: [],
    agenda: [],
    location: 'virtual'
  });

  const [newParticipant, setNewParticipant] = useState('');
  const [newAgendaItem, setNewAgendaItem] = useState('');

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        date: meeting.date || '',
        time: meeting.time || '',
        duration: meeting.duration || 60,
        type: meeting.type || 'client',
        clientId: meeting.clientId || '',
        participants: meeting.participants || [],
        agenda: meeting.agenda || [],
        location: meeting.location || 'virtual'
      });
    } else {
      // Set default date to today and time to next hour
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        date: now.toISOString().split('T')[0],
        time: nextHour.toTimeString().slice(0, 5)
      }));
    }
  }, [meeting]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !formData.participants.includes(newParticipant.trim())) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (participant) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant)
    }));
  };

  const handleAddAgendaItem = () => {
    if (newAgendaItem.trim()) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, newAgendaItem.trim()]
      }));
      setNewAgendaItem('');
    }
  };

  const handleRemoveAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const meetingData = {
      ...formData,
      clientName: clients.find(c => c._id === formData.clientId)?.organizationName || ''
    };

    onSave(meetingData);
  };

  const getClientOptions = () => {
    return clients.filter(client => client.status === 'active');
  };

  return (
    <div className="schedule-meeting-overlay">
      <div className="schedule-meeting-modal">
        <div className="schedule-meeting-header">
          <h2>{meeting ? 'Edit Meeting' : 'Schedule New Meeting'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-meeting-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Meeting Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="form-group">
              <label>Meeting Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="client">Client Meeting</option>
                <option value="internal">Internal Meeting</option>
                <option value="grant">Grant Review</option>
                <option value="planning">Planning Session</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              >
                <option value="virtual">Virtual Meeting</option>
                <option value="office">Office</option>
                <option value="client-site">Client Site</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.type === 'client' && (
              <div className="form-group">
                <label>Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                >
                  <option value="">Select a client</option>
                  {getClientOptions().map(client => (
                    <option key={client._id} value={client._id}>
                      {client.organizationName} - {client.primaryContactName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Meeting description..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Participants</label>
            <div className="participants-input">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                placeholder="Add participant email or name"
              />
              <button type="button" onClick={handleAddParticipant}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="participants-list">
              {formData.participants.map((participant, index) => (
                <span key={index} className="participant-tag">
                  {participant}
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(participant)}
                    className="remove-participant"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Agenda</label>
            <div className="agenda-input">
              <input
                type="text"
                value={newAgendaItem}
                onChange={(e) => setNewAgendaItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAgendaItem())}
                placeholder="Add agenda item"
              />
              <button type="button" onClick={handleAddAgendaItem}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <ul className="agenda-list">
              {formData.agenda.map((item, index) => (
                <li key={index}>
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveAgendaItem(index)}
                    className="remove-agenda-item"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {meeting ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeeting;