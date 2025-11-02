import React, { useState } from 'react';
import CalendarModal from './CalendarModal';

const CommunicationHub = ({ onBack, onEmails, onTemplates, onBulkEmail, clients }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const communicationStats = {
    totalEmails: 45,
    unreadEmails: 12,
    sentThisWeek: 23,
    responseRate: '78%'
  };

  const handleQuickAction = () => {
    setShowComingSoon(true);
  };

  const quickActions = [
    {
      id: 'emails',
      title: 'Email Management',
      description: 'Manage client emails, inbox, and sent items',
      icon: 'fas fa-envelope',
      color: '#1a472a',
      action: handleQuickAction,
      stats: `${communicationStats.totalEmails} Total Emails`
    },
    {
      id: 'templates',
      title: 'Email Templates',
      description: 'Create and manage email templates for quick communication',
      icon: 'fas fa-layer-group',
      color: '#d4af37',
      action: handleQuickAction,
      stats: '12 Templates Available'
    },
    {
      id: 'bulk-email',
      title: 'Bulk Email',
      description: 'Send emails to multiple clients at once',
      icon: 'fas fa-mail-bulk',
      color: '#2d5a3a',
      action: handleQuickAction,
      stats: `${clients.length} Clients Available`
    },
    {
      id: 'analytics',
      title: 'Communication Analytics',
      description: 'View communication metrics and performance',
      icon: 'fas fa-chart-bar',
      color: '#1a472a',
      action: handleQuickAction,
      stats: `${communicationStats.responseRate} Response Rate`
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'email',
      client: 'GreenTech Initiative',
      action: 'Email Sent',
      time: '2 hours ago',
      status: 'sent'
    },
    {
      id: 2,
      type: 'template',
      client: 'All Clients',
      action: 'Template Created',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'bulk',
      client: '5 Clients',
      action: 'Bulk Email Scheduled',
      time: '2 days ago',
      status: 'scheduled'
    }
  ];

  const upcomingCommunications = [
    {
      id: 1,
      date: new Date(2024, 10, 15),
      title: "Follow-up: Sarah Chen",
      description: "Grant proposal discussion and next steps",
      type: "Email Reminder",
      time: "10:00 AM",
      actions: ["Reschedule", "Send Now"]
    },
    {
      id: 2,
      date: new Date(2024, 10, 16),
      title: "Bulk Update: All Active Clients",
      description: "Quarterly grant opportunities newsletter",
      type: "Bulk Email",
      clientCount: 12,
      time: "9:00 AM",
      actions: ["Edit Template", "Preview"]
    }
  ];

  const calendarEvents = upcomingCommunications.map(comm => ({
    date: comm.date,
    time: comm.time,
    title: comm.title
  }));

  return (
    <div className="clients-communication-hub">
      {/* Updated Header with new CSS classes */}
      <div className="clients-hub-header">
        <div className="clients-hub-header-content">
          <div className="clients-hub-title">
            <h1>Communication Hub</h1>
            <p>Centralized platform for all client communication management</p>
          </div>
          <div className="clients-hub-actions">
            <button className="clients-btn clients-btn-secondary" onClick={onBack}>
              <i className="fas fa-arrow-left"></i>
              Back to Clients
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="clients-hub-toolbar">
        <div className="clients-hub-search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search communications, clients, or templates..." 
          />
        </div>
        <div className="clients-hub-filters">
          <select className="clients-hub-filter-select">
            <option>All Communication Types</option>
            <option>Emails</option>
            <option>Calls</option>
            <option>Meetings</option>
            <option>SMS</option>
          </select>
          <select className="clients-hub-filter-select">
            <option>All Status</option>
            <option>Sent</option>
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      <div className="clients-hub-main">
        {/* Communication Metrics */}
        <div className="clients-communication-metrics">
          <div className="clients-metric-card">
            <div className="clients-metric-icon">
              <i className="fas fa-envelope-open"></i>
            </div>
            <div className="clients-metric-value">{communicationStats.totalEmails}</div>
            <div className="clients-metric-label">Total Emails</div>
          </div>
          
          <div className="clients-metric-card">
            <div className="clients-metric-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="clients-metric-value">{communicationStats.unreadEmails}</div>
            <div className="clients-metric-label">Unread Emails</div>
          </div>
          
          <div className="clients-metric-card">
            <div className="clients-metric-icon">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="clients-metric-value">{communicationStats.sentThisWeek}</div>
            <div className="clients-metric-label">Sent This Week</div>
          </div>
          
          <div className="clients-metric-card">
            <div className="clients-metric-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="clients-metric-value">{communicationStats.responseRate}</div>
            <div className="clients-metric-label">Response Rate</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="clients-communication-hub-grid">
          {/* Left Column - Upcoming Communications & Recent Activity */}
          <div>
            {/* Upcoming Communications */}
            <div className="clients-upcoming-communications">
              <div className="clients-upcoming-header">
                <h3>Upcoming Communications</h3>
                <button 
                  className="clients-view-calendar-btn"
                  onClick={() => setShowCalendar(true)}
                >
                  <i className="fas fa-calendar-alt"></i>
                  View Calendar
                </button>
              </div>

              <div className="clients-communication-items">
                {upcomingCommunications.map(comm => (
                  <div key={comm.id} className="clients-communication-item">
                    <div className="clients-communication-date">
                      <div className="clients-communication-day">
                        {comm.date.getDate()}
                      </div>
                      <div className="clients-communication-month">
                        {comm.date.toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="clients-communication-content">
                      <div className="clients-communication-title">
                        {comm.title}
                      </div>
                      <div className="clients-communication-description">
                        {comm.description}
                      </div>
                      
                      <div className="clients-communication-meta">
                        <div className="clients-communication-badge">
                          <i className="fas fa-envelope"></i>
                          {comm.type}
                        </div>
                        <div className="clients-communication-time">
                          <i className="fas fa-clock"></i>
                          {comm.time}
                        </div>
                        {comm.clientCount && (
                          <div className="clients-communication-badge">
                            <i className="fas fa-users"></i>
                            {comm.clientCount} Clients
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="clients-communication-actions">
                      {comm.actions.map((action, index) => (
                        <button
                          key={index}
                          className={`clients-communication-action-btn ${
                            index === 0 ? 'primary' : 'outline'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Communications Table */}
            <div className="clients-recent-communications">
              <div className="clients-recent-header">
                <h3>Recent Communications</h3>
                <button className="clients-btn-link">View All</button>
              </div>
              <div className="clients-recent-table-container">
                <table className="clients-recent-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Client</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="clients-recent-row">
                      <td>
                        <span className="clients-comm-type-badge email">Email</span>
                      </td>
                      <td>GreenTech Initiative</td>
                      <td>Grant Proposal Feedback</td>
                      <td>Nov 15, 2024</td>
                      <td>
                        <div className="clients-comm-status sent">
                          <i className="fas fa-check-circle"></i>
                          Sent
                        </div>
                      </td>
                    </tr>
                    <tr className="clients-recent-row">
                      <td>
                        <span className="clients-comm-type-badge call">Call</span>
                      </td>
                      <td>Sarah Chen</td>
                      <td>Budget Discussion</td>
                      <td>Nov 14, 2024</td>
                      <td>
                        <div className="clients-comm-status completed">
                          <i className="fas fa-check-circle"></i>
                          Completed
                        </div>
                      </td>
                    </tr>
                    <tr className="clients-recent-row">
                      <td>
                        <span className="clients-comm-type-badge meeting">Meeting</span>
                      </td>
                      <td>Michael Rodriguez</td>
                      <td>Q1 Planning Session</td>
                      <td>Nov 18, 2024</td>
                      <td>
                        <div className="clients-comm-status scheduled">
                          <i className="fas fa-clock"></i>
                          Scheduled
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions Sidebar */}
          <div className="clients-quick-actions-sidebar">
            {/* Quick Actions Card */}
            <div className="clients-quick-action-card">
              <div className="clients-quick-action-header">
                <div className="clients-quick-action-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h4>Quick Actions</h4>
              </div>
              <div className="clients-quick-action-content">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    className="clients-quick-action-btn primary"
                    onClick={action.action}
                  >
                    <i className={action.icon}></i>
                    {action.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Card */}
            <div className="clients-quick-action-card">
              <div className="clients-quick-action-header">
                <div className="clients-quick-action-icon">
                  <i className="fas fa-layer-group"></i>
                </div>
                <h4>Email Templates</h4>
              </div>
              <div className="clients-quick-action-content">
                <div className="clients-template-preview">
                  <h5>Grant Follow-up</h5>
                  <p>Professional follow-up template for grant applications</p>
                </div>
                <div className="clients-quick-action-stats">
                  <i className="fas fa-chart-line"></i>
                  Used 45 times this month
                </div>
                <div className="clients-quick-action-buttons">
                  <button className="clients-quick-action-btn outline" onClick={handleQuickAction}>
                    <i className="fas fa-eye"></i>
                    Preview
                  </button>
                  <button className="clients-quick-action-btn primary" onClick={handleQuickAction}>
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Email Card */}
            <div className="clients-quick-action-card">
              <div className="clients-quick-action-header">
                <div className="clients-quick-action-icon">
                  <i className="fas fa-mail-bulk"></i>
                </div>
                <h4>Bulk Email</h4>
              </div>
              <div className="clients-quick-action-content">
                <div className="clients-quick-action-stats">
                  <i className="fas fa-users"></i>
                  {clients.filter(c => c.status === 'active').length} Active Clients
                </div>
                <div className="clients-quick-action-buttons">
                  <button className="clients-quick-action-btn outline" onClick={handleQuickAction}>
                    <i className="fas fa-list"></i>
                    Select Clients
                  </button>
                  <button className="clients-quick-action-btn primary" onClick={handleQuickAction}>
                    <i className="fas fa-rocket"></i>
                    Start Bulk Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Summary */}
        <div className="clients-communication-summary">
          <div className="clients-comm-summary-card">
            <div className="clients-comm-summary-icon primary">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="clients-comm-summary-content">
              <h3>1,247</h3>
              <p>Total Communications</p>
            </div>
          </div>
          
          <div className="clients-comm-summary-card">
            <div className="clients-comm-summary-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="clients-comm-summary-content">
              <h3>89%</h3>
              <p>Success Rate</p>
            </div>
          </div>
          
          <div className="clients-comm-summary-card">
            <div className="clients-comm-summary-icon warning">
              <i className="fas fa-clock"></i>
            </div>
            <div className="clients-comm-summary-content">
              <h3>12</h3>
              <p>Pending Actions</p>
            </div>
          </div>
          
          <div className="clients-comm-summary-card">
            <div className="clients-comm-summary-icon info">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="clients-comm-summary-content">
              <h3>+18%</h3>
              <p>Monthly Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal 
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        events={calendarEvents}
      />

      {/* Feature Coming Soon Modal */}
      {showComingSoon && (
        <div className="clients-modal-overlay">
          <div className="clients-modal">
            <div className="clients-modal-header">
              <h3>Feature Coming Soon</h3>
              <button 
                className="clients-modal-close"
                onClick={() => setShowComingSoon(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="clients-modal-content">
              <div className="clients-coming-soon-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h4>Feature Coming Soon</h4>
              <p>We're working hard to bring you this feature. It will be available in the next update!</p>
              <div className="clients-modal-actions">
                <button 
                  className="clients-btn clients-btn-primary"
                  onClick={() => setShowComingSoon(false)}
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;