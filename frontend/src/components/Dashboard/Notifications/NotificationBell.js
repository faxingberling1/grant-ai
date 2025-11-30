import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import NotificationList from './NotificationList';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { 
    unreadCount, 
    markAllAsRead, 
    notifications,
    connected,
    loading,
    loadNotifications
  } = useNotifications();
  
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh notifications when dropdown opens or tab changes
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const refreshNotifications = async () => {
        try {
          await loadNotifications({ filter: activeTab });
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      };

      refreshNotifications();
    }
  }, [isOpen, activeTab, loadNotifications, isAuthenticated]);

  const handleBellClick = () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot open notifications');
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadNotifications({ refresh: true });
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const tabs = [
    { 
      key: 'all', 
      label: 'All', 
      count: notifications.length,
      icon: 'fas fa-bell'
    },
    { 
      key: 'unread', 
      label: 'Unread', 
      count: unreadCount,
      icon: 'fas fa-envelope'
    },
    { 
      key: 'meetings', 
      label: 'Meetings', 
      count: notifications.filter(n => 
        n.type === 'meeting_reminder' || 
        n.category === 'meetings'
      ).length,
      icon: 'fas fa-calendar-alt'
    },
    { 
      key: 'grants', 
      label: 'Grants', 
      count: notifications.filter(n => 
        n.type === 'grant_deadline' || 
        n.category === 'grants'
      ).length,
      icon: 'fas fa-file-invoice-dollar'
    }
  ];

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`notification-bell ${isOpen ? 'open' : ''}`}>
      <div className="bell-container" ref={bellRef}>
        <button 
          className={`bell-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
          onClick={handleBellClick}
          title="Notifications"
        >
          <div className="bell-icon">
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          {connected ? (
            <div className="connection-dot connected" title="Real-time connected"></div>
          ) : (
            <div className="connection-dot disconnected" title="Real-time disconnected"></div>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="notification-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-header">
              <div className="header-main">
                <h3>Notifications</h3>
                <div className="header-status">
                  {connected ? (
                    <div className="status-connected" title="Real-time updates active">
                      <i className="fas fa-wifi"></i>
                      <span>Live</span>
                    </div>
                  ) : (
                    <div className="status-disconnected" title="Real-time updates disconnected">
                      <i className="fas fa-wifi-slash"></i>
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="header-actions">
                <button 
                  className="btn-refresh"
                  onClick={handleRefresh}
                  title="Refresh notifications"
                  disabled={loading}
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                </button>
                
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0 || loading}
                  >
                    <i className="fas fa-check-double"></i>
                    Mark All Read
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="notification-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''} ${
                    tab.count === 0 ? 'empty' : ''
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                  data-tab={tab.key}
                >
                  <i className={tab.icon}></i>
                  <span className="tab-label">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`tab-count ${
                      tab.key === 'unread' ? 'unread' : ''
                    }`}>
                      {tab.count > 99 ? '99+' : tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="notification-content">
              <NotificationList filter={activeTab} />
            </div>

            <div className="notification-footer">
              <div className="footer-info">
                <span>
                  {connected ? 'Real-time updates active' : 'Real-time updates disconnected'}
                </span>
              </div>
              <a 
                href="/dashboard/notifications" 
                className="view-all-link"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;