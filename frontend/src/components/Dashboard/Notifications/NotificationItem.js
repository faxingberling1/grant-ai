import React, { useState } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import './NotificationItem.css';

const NotificationItem = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification._id || notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteNotification(notification._id || notification.id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (!notification.isRead) {
      await markAsRead(notification._id || notification.id);
    }
  };

  const getPriorityClass = () => {
    return `priority-${notification.priority || 'medium'}`;
  };

  const getIcon = () => {
    const icons = {
      meeting_reminder: 'fas fa-calendar-alt',
      grant_deadline: 'fas fa-clock',
      client_communication: 'fas fa-comments',
      submission_status: 'fas fa-paper-plane',
      system_alert: 'fas fa-exclamation-triangle',
      ai_completion: 'fas fa-robot',
      email_sent: 'fas fa-envelope',
      collaboration: 'fas fa-users',
      info: 'fas fa-info-circle',
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      error: 'fas fa-exclamation-circle'
    };
    return icons[notification.type] || 'fas fa-bell';
  };

  const getPriorityIcon = () => {
    const priorityIcons = {
      high: 'fas fa-arrow-up',
      medium: 'fas fa-minus',
      low: 'fas fa-arrow-down'
    };
    return priorityIcons[notification.priority] || 'fas fa-minus';
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffInDays > 365 ? 'numeric' : undefined
      });
    }
  };

  const isRecent = () => {
    if (!notification.createdAt) return false;
    const date = new Date(notification.createdAt);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    return diffInMinutes < 5; // Less than 5 minutes old
  };

  return (
    <div 
      className={`notification-item ${getPriorityClass()} ${
        notification.isRead ? 'read' : 'unread'
      } ${isRecent() ? 'recent' : ''} ${isDeleting ? 'deleting' : ''}`}
      onClick={handleClick}
      data-notification-type={notification.type}
      data-notification-priority={notification.priority || 'medium'}
    >
      <div className="notification-icon">
        <i className={getIcon()}></i>
        {notification.priority === 'high' && (
          <div className="priority-indicator high"></div>
        )}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-title">
            {notification.title}
          </div>
          <div className="notification-priority">
            <i className={getPriorityIcon()}></i>
            <span>{notification.priority || 'medium'}</span>
          </div>
        </div>
        
        <div className="notification-message">
          {notification.message}
        </div>
        
        <div className="notification-footer">
          <div className="notification-time">
            {formatTime(notification.createdAt || notification.timestamp)}
          </div>
          {notification.category && (
            <div className="notification-category">
              {notification.category}
            </div>
          )}
        </div>
      </div>
      
      <div className="notification-actions">
        {isRecent() && (
          <div className="recent-badge" title="New notification">
            <i className="fas fa-bolt"></i>
          </div>
        )}
        
        {!notification.isRead && (
          <button 
            className="mark-read-btn"
            onClick={handleMarkAsRead}
            title="Mark as read"
          >
            <i className="fas fa-check"></i>
          </button>
        )}
        
        <button 
          className={`delete-notification ${isDeleting ? 'deleting' : ''}`}
          onClick={handleDelete}
          title="Delete notification"
          disabled={isDeleting}
        >
          <i className={`fas ${isDeleting ? 'fa-spinner fa-spin' : 'fa-times'}`}></i>
        </button>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="unread-indicator"></div>
      )}
    </div>
  );
};

export default NotificationItem;