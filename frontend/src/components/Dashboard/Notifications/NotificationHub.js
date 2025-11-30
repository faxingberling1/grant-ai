import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import NotificationList from './NotificationList';
import './NotificationHub.css';

const NotificationHub = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  const { 
    unreadCount, 
    markAllAsRead, 
    notifications,
    connected,
    loading,
    loadNotifications,
    reconnectWebSocket,
    refreshNotifications
  } = useNotifications();
  
  const { isAuthenticated } = useAuth();

  // Close notification hub when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-hub') && !event.target.closest('.notification-trigger')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Load notifications when hub opens or tab changes
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      console.log('🔔 Notification hub opened, loading notifications...');
      loadHubNotifications();
    }
  }, [isOpen, isAuthenticated]);

  // Load notifications when tab changes
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      console.log(`🔔 Tab changed to ${activeTab}, filtering notifications...`);
      // Don't reload from API, just filter locally
      // loadHubNotifications();
    }
  }, [activeTab, isOpen, isAuthenticated]);

  const loadHubNotifications = async () => {
    try {
      setLocalLoading(true);
      console.log('🔄 Loading notifications for hub...');
      
      // Use the refreshNotifications method which is more reliable
      await refreshNotifications();
      
      console.log('✅ Notifications loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLocalLoading(true);
      await markAllAsRead();
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLocalLoading(true);
      console.log('🔄 Manually refreshing notifications...');
      await refreshNotifications();
      console.log('✅ Notifications refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh notifications:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleReconnect = () => {
    console.log('🔄 Manual WebSocket reconnection');
    reconnectWebSocket();
  };

  const toggleHub = () => {
    if (!isAuthenticated) {
      console.log('🔐 User not authenticated, cannot open notifications');
      return;
    }
    const newState = !isOpen;
    console.log(`🔔 Toggling notification hub: ${newState ? 'OPEN' : 'CLOSE'}`);
    setIsOpen(newState);
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'unread') {
      return notifications.filter(n => !n.read && !n.isRead);
    } else if (activeTab === 'meetings') {
      return notifications.filter(n => 
        n.type === 'meeting' || 
        n.type === 'meeting_reminder' ||
        n.category === 'meetings'
      );
    } else if (activeTab === 'grants') {
      return notifications.filter(n => 
        n.type === 'grant' || 
        n.type === 'grant_deadline' ||
        n.category === 'grants'
      );
    } else if (activeTab === 'system') {
      return notifications.filter(n => 
        n.type === 'system' || 
        n.type === 'system_alert' ||
        n.category === 'system'
      );
    }
    return notifications;
  };

  // Calculate tab counts
  const getTabCounts = () => {
    const allCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;
    const meetingsCount = notifications.filter(n => 
      n.type === 'meeting' || 
      n.type === 'meeting_reminder' ||
      n.category === 'meetings'
    ).length;
    const grantsCount = notifications.filter(n => 
      n.type === 'grant' || 
      n.type === 'grant_deadline' ||
      n.category === 'grants'
    ).length;
    const systemCount = notifications.filter(n => 
      n.type === 'system' || 
      n.type === 'system_alert' ||
      n.category === 'system'
    ).length;

    return {
      all: allCount,
      unread: unreadCount,
      meetings: meetingsCount,
      grants: grantsCount,
      system: systemCount
    };
  };

  const tabCounts = getTabCounts();
  const filteredNotifications = getFilteredNotifications();
  const isLoading = localLoading || loading;

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { 
      key: 'all', 
      label: 'All', 
      count: tabCounts.all,
      icon: 'fas fa-bell'
    },
    { 
      key: 'unread', 
      label: 'Unread', 
      count: tabCounts.unread,
      icon: 'fas fa-envelope'
    },
    { 
      key: 'meetings', 
      label: 'Meetings', 
      count: tabCounts.meetings,
      icon: 'fas fa-calendar-alt'
    },
    { 
      key: 'grants', 
      label: 'Grants', 
      count: tabCounts.grants,
      icon: 'fas fa-file-invoice-dollar'
    },
    { 
      key: 'system', 
      label: 'System', 
      count: tabCounts.system,
      icon: 'fas fa-cog'
    }
  ];

  return (
    <div className="notification-hub-container">
      {/* Notification Bell Trigger */}
      <div className="notification-trigger" onClick={toggleHub}>
        <div className="bell-icon">
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {connected ? (
          <div className="connection-dot connected" title="Real-time connected">
            <i className="fas fa-circle"></i>
          </div>
        ) : (
          <div className="connection-dot disconnected" title="Real-time disconnected">
            <i className="fas fa-circle"></i>
          </div>
        )}
      </div>

      {/* Notification Hub Dropdown */}
      {isOpen && (
        <div className="notification-hub-dropdown">
          <div className="notification-hub">
            {/* Header */}
            <div className="notification-hub-header">
              <div className="header-main">
                <div className="header-title">
                  <h2>
                    Notifications
                    {isLoading && (
                      <i className="fas fa-spinner fa-spin loading-spinner"></i>
                    )}
                  </h2>
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
                  {!connected && (
                    <button 
                      className="btn-reconnect"
                      onClick={handleReconnect}
                      title="Reconnect to real-time updates"
                      disabled={isLoading}
                    >
                      <i className="fas fa-plug"></i>
                      Reconnect
                    </button>
                  )}
                  
                  <button 
                    className="btn-refresh"
                    onClick={handleRefresh}
                    title="Refresh notifications"
                    disabled={isLoading}
                  >
                    <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                    Refresh
                  </button>
                  
                  {unreadCount > 0 && (
                    <button 
                      className="btn-mark-all-read"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0 || isLoading}
                    >
                      <i className="fas fa-check-double"></i>
                      Mark All Read
                    </button>
                  )}
                  
                  <button 
                    className="btn-close-hub"
                    onClick={() => setIsOpen(false)}
                    title="Close notifications"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{notifications.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unread</span>
                  <span className="stat-value unread">{unreadCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Filtered</span>
                  <span className="stat-value filtered">
                    {filteredNotifications.length}
                  </span>
                </div>
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
                  disabled={isLoading}
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

            {/* Content */}
            <div className="notification-content">
              {isLoading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading notifications...</p>
                </div>
              ) : (
                <NotificationList 
                  filter={activeTab} 
                  notifications={filteredNotifications}
                />
              )}
            </div>

            {/* Footer */}
            <div className="notification-hub-footer">
              <div className="footer-info">
                <span>
                  {connected ? 'Real-time updates active' : 'Real-time updates disconnected'}
                  {isLoading && ' • Loading...'}
                </span>
              </div>
              <div className="footer-actions">
                <button 
                  className="btn-load-more"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo"></i>
                      Refresh
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationHub;