import React from 'react';
import './CalendarSidebar.css';

const CalendarSidebar = ({ activeView, onViewChange, upcomingCount, totalMeetings }) => {
  const menuItems = [
    {
      id: 'calendar',
      label: 'Calendar View',
      icon: 'fas fa-calendar-alt',
      description: 'Monthly calendar overview'
    },
    {
      id: 'upcoming',
      label: 'Upcoming Meetings',
      icon: 'fas fa-list',
      description: `(${upcomingCount} upcoming)`,
      badge: upcomingCount
    },
    {
      id: 'list',
      label: 'All Meetings',
      icon: 'fas fa-th-list',
      description: `(${totalMeetings} total)`,
      badge: totalMeetings
    }
  ];

  const quickStats = [
    {
      label: 'Today',
      value: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      icon: 'fas fa-calendar-day'
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: 'fas fa-clock'
    },
    {
      label: 'This Week',
      value: Math.floor(Math.random() * 10) + 1, // Mock data
      icon: 'fas fa-calendar-week'
    }
  ];

  return (
    <div className="calendar-sidebar">
      <div className="sidebar-header">
        <h3>Calendar</h3>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <div className="nav-item-icon">
              <i className={item.icon}></i>
            </div>
            <div className="nav-item-content">
              <span className="nav-item-label">{item.label}</span>
              <span className="nav-item-description">{item.description}</span>
            </div>
            {item.badge > 0 && (
              <span className="nav-item-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-stats">
        <h4>Quick Stats</h4>
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-tips">
        <h4>Quick Tips</h4>
        <div className="tip-item">
          <i className="fas fa-lightbulb"></i>
          <span>Click on any date to schedule a meeting</span>
        </div>
        <div className="tip-item">
          <i className="fas fa-lightbulb"></i>
          <span>Use the meeting room for virtual client calls</span>
        </div>
        <div className="tip-item">
          <i className="fas fa-lightbulb"></i>
          <span>Set reminders for important grant deadlines</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;