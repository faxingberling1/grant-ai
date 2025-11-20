import React, { useState } from 'react';
import MeetingCard from './MeetingCard';
import './MeetingList.css';

const MeetingList = ({ meetings, onMeetingSelect, onStartMeeting, onEditMeeting, onDeleteMeeting }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredMeetings = meetings.filter(meeting => {
    switch (filter) {
      case 'upcoming':
        return new Date(meeting.date + 'T' + meeting.time) > new Date() && meeting.status !== 'cancelled' && meeting.status !== 'completed';
      case 'past':
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        return meetingDate <= new Date() || meeting.status === 'completed' || meeting.status === 'cancelled';
      case 'client':
        return meeting.type === 'client';
      case 'internal':
        return meeting.type === 'internal';
      case 'grant':
        return meeting.type === 'grant';
      case 'planning':
        return meeting.type === 'planning';
      default:
        return true;
    }
  });

  const sortedMeetings = filteredMeetings.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'client':
        return (a.clientName || '').localeCompare(b.clientName || '');
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  return (
    <div className="meeting-list">
      <div className="meeting-list-header">
        <h2>All Meetings</h2>
        <div className="meeting-list-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Meetings</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="client">Client Meetings</option>
            <option value="internal">Internal</option>
            <option value="grant">Grant Reviews</option>
            <option value="planning">Planning</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="client">Sort by Client</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      <div className="meeting-list-content">
        {sortedMeetings.length > 0 ? (
          sortedMeetings.map(meeting => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              onSelect={onMeetingSelect}
              onStart={onStartMeeting}
              onEdit={onEditMeeting}
              onDelete={onDeleteMeeting}
              showActions={true}
            />
          ))
        ) : (
          <div className="no-meetings">
            <i className="fas fa-calendar-times"></i>
            <h3>No meetings found</h3>
            <p>Schedule your first meeting to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingList;