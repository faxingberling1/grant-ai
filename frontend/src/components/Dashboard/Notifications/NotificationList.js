import React, { useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import './NotificationList.css';

const NotificationList = ({ filter = 'all' }) => {
  const { 
    notifications, 
    unreadCount,
    loading, 
    connected,
    connectionError,
    reconnectWebSocket,
    markAsRead, 
    deleteNotification,
    markAllAsRead
  } = useNotifications();

  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'meetings':
        return notifications.filter(n => 
          n.type === 'meeting_reminder' || 
          n.category === 'meetings'
        );
      case 'grants':
        return notifications.filter(n => 
          n.type === 'grant_deadline' || 
          n.category === 'grants'
        );
      case 'system':
        return notifications.filter(n => 
          n.type === 'system_alert' || 
          n.category === 'system'
        );
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const displayedNotifications = filteredNotifications.slice(0, 8);

  useEffect(() => {
    console.log(`🔌 WebSocket Status:`, {
      connected,
      connectionError,
      notificationsCount: notifications.length,
      unreadCount,
      filter,
      filteredCount: filteredNotifications.length
    });
  }, [connected, connectionError, notifications.length, unreadCount, filter, filteredNotifications.length]);

  const handleRetryConnection = () => {
    reconnectWebSocket();
  };

  if (loading) {
    return (
      <div className="notification-list loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
        {!connected && (
          <div className="connection-status offline">
            <i className="fas fa-wifi-slash"></i>
            <span>Connecting to real-time updates...</span>
          </div>
        )}
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    const emptyMessages = {
      all: {
        icon: 'fas fa-bell-slash',
        title: 'No notifications',
        message: 'You\'re all caught up!'
      },
      unread: {
        icon: 'fas fa-envelope-open',
        title: 'No unread notifications',
        message: 'All notifications are read!'
      },
      meetings: {
        icon: 'fas fa-calendar-check',
        title: 'No meeting notifications',
        message: 'No upcoming meetings or reminders'
      },
      grants: {
        icon: 'fas fa-file-invoice-dollar',
        title: 'No grant notifications',
        message: 'No grant-related updates'
      },
      system: {
        icon: 'fas fa-cog',
        title: 'No system notifications',
        message: 'All systems operational'
      }
    };

    const emptyState = emptyMessages[filter] || emptyMessages.all;

    return (
      <div className="notification-list empty">
        <div className="empty-state">
          <i className={emptyState.icon}></i>
          <p>{emptyState.title}</p>
          <span>{emptyState.message}</span>
          
          {/* Connection status in empty state */}
          {!connected && (
            <div className="connection-status offline">
              <i className="fas fa-wifi-slash"></i>
              <div className="connection-details">
                <span>Real-time updates disconnected</span>
                {connectionError && (
                  <small className="error-message">{connectionError}</small>
                )}
                <button 
                  className="retry-connection-btn"
                  onClick={handleRetryConnection}
                >
                  <i className="fas fa-redo"></i>
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {/* Connection status indicator */}
      {!connected && (
        <div className="connection-status warning">
          <i className="fas fa-exclamation-triangle"></i>
          <div className="connection-details">
            <span>Real-time updates disconnected</span>
            {connectionError && (
              <small className="error-message">{connectionError}</small>
            )}
            <button 
              className="retry-connection-btn"
              onClick={handleRetryConnection}
            >
              <i className="fas fa-redo"></i>
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="notification-items">
        {displayedNotifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>

      {/* Show more indicator */}
      {filteredNotifications.length > displayedNotifications.length && (
        <div className="notification-list-footer">
          <span className="more-notifications">
            And {filteredNotifications.length - displayedNotifications.length} more {filter !== 'all' ? filter : ''} notifications
          </span>
        </div>
      )}

      {/* All read indicator */}
      {filter === 'all' && unreadCount === 0 && displayedNotifications.length > 0 && (
        <div className="all-read-indicator">
          <i className="fas fa-check-circle"></i>
          <span>All caught up! All notifications are read.</span>
        </div>
      )}
    </div>
  );
};

export default NotificationList;