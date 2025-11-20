import React, { useState } from 'react';
import MeetingCard from './MeetingCard';
import './CalendarView.css';

const CalendarView = ({ meetings, onMeetingSelect, onScheduleMeeting, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMeetingsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === dateString);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`prev-${i}`} className="calendar-day other-month"></div>);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateMeetings = getMeetingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="calendar-date">{i}</div>
          <div className="calendar-events">
            {dateMeetings.slice(0, 3).map(meeting => (
              <div
                key={meeting._id}
                className={`calendar-event ${meeting.type}`}
                onClick={() => onMeetingSelect(meeting)}
              >
                {meeting.title}
              </div>
            ))}
            {dateMeetings.length > 3 && (
              <div className="calendar-more-events">
                +{dateMeetings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  // Get today's meetings for the sidebar
  const getTodaysMeetings = () => {
    const today = new Date().toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="calendar-view">
      <div className="calendar-controls">
        <div className="calendar-navigation">
          <button onClick={() => navigateMonth(-1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => navigateMonth(1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div className="calendar-view-options">
          <button 
            className={view === 'month' ? 'active' : ''}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button 
            className={view === 'week' ? 'active' : ''}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button 
            className={view === 'day' ? 'active' : ''}
            onClick={() => setView('day')}
          >
            Day
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {renderMonthView()}
        </div>
      </div>

      <div className="calendar-upcoming">
        <h3>Today's Meetings</h3>
        <div className="today-meetings">
          {getTodaysMeetings().length > 0 ? (
            getTodaysMeetings().map(meeting => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                onSelect={onMeetingSelect}
                onStart={() => onMeetingSelect(meeting)}
                compact={true}
              />
            ))
          ) : (
            <p className="no-meetings">No meetings scheduled for today</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;