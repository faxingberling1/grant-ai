import React, { useState } from 'react';
import './CalendarModal.css'; // Import the CSS file

const CalendarModal = ({ isOpen, onClose, events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  if (!isOpen) return null;

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and total days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString()
    });
  }
  
  // Next month days
  const totalCells = 42; // 6 weeks
  const nextMonthDays = totalCells - calendarDays.length;
  for (let day = 1; day <= nextMonthDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Check if day has events
  const hasEvents = (date) => {
    return events.some(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };
  
  // Get events for selected date
  const getEventsForDate = (date) => {
    return events.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.date);
    }
  };

  return (
    <div className="clients-calendar-modal">
      <div className="clients-calendar-container">
        <div className="clients-calendar-header">
          <h3>Communication Calendar</h3>
          <button className="clients-calendar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="clients-calendar-content">
          <div className="clients-calendar-grid">
            <div className="clients-calendar-controls">
              <div className="clients-calendar-nav">
                <button className="clients-calendar-nav-btn" onClick={prevMonth}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="clients-calendar-month">
                  {monthNames[currentMonth]} {currentYear}
                </div>
                <button className="clients-calendar-nav-btn" onClick={nextMonth}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <button className="clients-calendar-view-btn" onClick={goToToday}>
                <i className="fas fa-calendar-day"></i>
                Today
              </button>
            </div>
            
            <div className="clients-calendar-weekdays">
              {weekdays.map(day => (
                <div key={day} className="clients-calendar-weekday">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="clients-calendar-days">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`clients-calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${day.isToday ? 'today' : ''} ${
                    hasEvents(day.date) ? 'has-event' : ''
                  } ${
                    selectedDate.toDateString() === day.date.toDateString() ? 'selected' : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="clients-calendar-date">
                    {day.date.getDate()}
                  </span>
                  {hasEvents(day.date) && (
                    <div className="clients-calendar-event-dot"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="clients-calendar-events">
            <h4>Upcoming Communications</h4>
            <div className="clients-calendar-event-list">
              {events.map((event, index) => (
                <div key={index} className="clients-calendar-event-item">
                  <div className="clients-calendar-event-time">
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </div>
                  <div className="clients-calendar-event-title">
                    {event.title}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="clients-calendar-empty">
                  <i className="fas fa-calendar-times"></i>
                  <h4>No Upcoming Communications</h4>
                  <p>Schedule communications to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;