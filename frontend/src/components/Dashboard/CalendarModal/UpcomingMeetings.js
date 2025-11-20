import React from 'react';
import MeetingCard from './MeetingCard';
import './UpcomingMeetings.css';

const UpcomingMeetings = ({ meetings, onMeetingSelect, onStartMeeting }) => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const getMeetingsForPeriod = (startDate, endDate = null) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date + 'T' + meeting.time);
      if (endDate) {
        return meetingDate >= startDate && meetingDate < endDate;
      }
      return meetingDate >= startDate;
    });
  };

  const todaysMeetings = getMeetingsForPeriod(now, tomorrow);
  const tomorrowsMeetings = getMeetingsForPeriod(tomorrow, new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000));
  const thisWeekMeetings = getMeetingsForPeriod(tomorrow, nextWeek);
  const laterMeetings = getMeetingsForPeriod(nextWeek);

  const renderMeetingSection = (title, meetings, period) => (
    <div className="meeting-period-section">
      <h3 className="meeting-period-title">
        {title}
        <span className="meeting-count">({meetings.length})</span>
      </h3>
      <div className="meeting-period-list">
        {meetings.length > 0 ? (
          meetings.map(meeting => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              onSelect={onMeetingSelect}
              onStart={onStartMeeting}
              compact={true}
            />
          ))
        ) : (
          <p className="no-meetings-period">No meetings {period}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="upcoming-meetings">
      <div className="upcoming-meetings-header">
        <h2>📋 Upcoming Meetings</h2>
        <p>Your scheduled meetings and appointments</p>
      </div>

      <div className="upcoming-meetings-content">
        {renderMeetingSection("Today's Meetings", todaysMeetings, "today")}
        {renderMeetingSection("Tomorrow's Meetings", tomorrowsMeetings, "tomorrow")}
        {renderMeetingSection("This Week", thisWeekMeetings, "this week")}
        {renderMeetingSection("Later", laterMeetings, "scheduled")}
      </div>

      {meetings.length === 0 && (
        <div className="no-upcoming-meetings">
          <i className="fas fa-calendar-plus"></i>
          <h3>No upcoming meetings</h3>
          <p>Schedule a meeting to see it here</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingMeetings;