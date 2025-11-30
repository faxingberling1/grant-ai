import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  // ✅ FIXED: Use correct property names from AuthContext
  const { currentUser: user, authToken: token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef(null);

  // Stable loadNotifications function with useCallback
  const loadNotifications = useCallback(async (options = {}) => {
    try {
      console.log('📥 Loading notifications with options:', options);
      setLoading(true);
      
      const response = await notificationService.loadNotificationsForContext(options);
      
      console.log('📥 Notification service response:', response);
      
      if (response && response.notifications) {
        console.log(`📥 Setting ${response.notifications.length} notifications`);
        setNotifications(response.notifications);
        
        const unread = response.notifications.filter(notif => !notif.read && !notif.isRead).length;
        setUnreadCount(unread);
        console.log(`📥 Calculated unread count: ${unread}`);
      } else if (response && Array.isArray(response)) {
        console.log(`📥 Setting ${response.length} notifications from array`);
        setNotifications(response);
        const unread = response.filter(notif => !notif.read && !notif.isRead).length;
        setUnreadCount(unread);
      } else {
        console.warn('❌ Unexpected response structure, setting empty notifications');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clean up timeouts and sockets
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebSocket connection...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsReconnecting(false);
    setConnected(false);
  }, []);

  // Enhanced WebSocket connection with better error handling
  const connectWebSocket = useCallback(() => {
    // Clean up any existing connection first
    cleanup();

    if (!token) {
      console.log('❌ No token available for WebSocket connection');
      setConnectionError('Authentication required');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID available for WebSocket connection');
      setConnectionError('User information missing');
      return;
    }

    // Don't reconnect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      setConnectionError('Unable to establish real-time connection. Please refresh the page.');
      return;
    }

    try {
      console.log('🔌 Attempting WebSocket connection...');
      console.log('🔌 User ID:', user.id);
      console.log('🔌 Token available:', !!token);
      
      setIsReconnecting(true);
      setConnectionError(null);
      
      // Get the API URL - use the HTTP URL, Socket.io will handle the protocol
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('🔌 API URL:', apiUrl);

      const socket = io(apiUrl, {
        auth: {
          token: token
        },
        query: {
          userId: user.id
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        forceNew: true
      });

      socketRef.current = socket;

      // Connection established
      socket.on('connect', () => {
        console.log('✅ SUCCESS: Connected to WebSocket server');
        console.log('✅ Socket ID:', socket.id);
        setConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        setIsReconnecting(false);
        
        // Join user-specific room
        socket.emit('join-user-room', user.id);
        console.log(`👤 Joined user room: ${user.id}`);
      });

      // Connection lost
      socket.on('disconnect', (reason) => {
        console.log('🔌 DISCONNECTED from WebSocket server. Reason:', reason);
        setConnected(false);
        setIsReconnecting(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, need to manually reconnect
          console.log('🔄 Server disconnected, will attempt reconnect...');
          reconnectAttemptsRef.current += 1;
          scheduleReconnection();
        } else if (reason === 'transport close') {
          console.log('🔄 Transport closed, will attempt reconnect...');
          reconnectAttemptsRef.current += 1;
          scheduleReconnection();
        }
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket CONNECTION ERROR:', error);
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name,
          description: error.description
        });
        
        setConnected(false);
        setConnectionError(`Connection failed: ${error.message}`);
        setIsReconnecting(false);
        reconnectAttemptsRef.current += 1;
        
        // Attempt reconnection after delay
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log(`🔄 Scheduling reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          scheduleReconnection();
        } else {
          console.error('❌ Max reconnection attempts reached');
          setConnectionError('Failed to establish real-time connection. Click "Retry Connection" to try again.');
        }
      });

      // Reconnection events
      socket.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 WebSocket reconnection attempt ${attempt}`);
        setIsReconnecting(true);
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ WebSocket reconnection failed');
        setConnectionError('Failed to establish real-time connection. Click "Retry Connection" to try again.');
        setIsReconnecting(false);
      });

      socket.on('reconnect', (attempt) => {
        console.log(`✅ WebSocket reconnected after ${attempt} attempts`);
        setConnected(true);
        setConnectionError(null);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
      });

      // Listen for real-time notifications
      socket.on('notification:new', (notification) => {
        console.log('📢 Real-time notification received:', notification);
        addNotification(notification);
      });

      socket.on('notification:update', (notification) => {
        console.log('📢 Notification update received:', notification);
        updateNotification(notification);
      });

      socket.on('notification:delete', (data) => {
        console.log('📢 Notification delete received:', data);
        removeNotification(data.notificationId);
      });

      socket.on('notification:markAllRead', () => {
        console.log('📢 All notifications marked as read');
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true,
            isRead: true 
          }))
        );
        setUnreadCount(0);
      });

      // Test event to verify connection
      socket.on('connected', (data) => {
        console.log('✅ Server acknowledged connection:', data);
      });

      // Manual connection attempt
      console.log('🔌 Starting Socket.io connection...');
      socket.connect();

    } catch (error) {
      console.error('❌ Error setting up WebSocket:', error);
      setConnectionError(`Setup error: ${error.message}`);
      setIsReconnecting(false);
      reconnectAttemptsRef.current += 1;
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        scheduleReconnection();
      }
    }
  }, [token, user, cleanup]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
    console.log(`⏰ Scheduling reconnection in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Executing scheduled reconnection...');
      connectWebSocket();
    }, delay);
  }, [connectWebSocket]);

  const disconnectWebSocket = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    cleanup();
    reconnectAttemptsRef.current = 0;
  }, [cleanup]);

  const reconnectWebSocket = () => {
    console.log('🔄 Manual reconnection requested by user');
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    setIsReconnecting(true);
    connectWebSocket();
  };

  // Fixed addNotification to prevent state calculation loops
  const addNotification = useCallback((notification) => {
    console.log('➕ Adding new notification:', notification);
    setNotifications(prev => {
      const updated = [notification, ...prev];
      // Check both 'read' and 'isRead' properties for compatibility
      const isRead = notification.read || notification.isRead;
      if (!isRead) {
        setUnreadCount(prevCount => prevCount + 1);
      }
      return updated;
    });
  }, []);

  // Fixed updateNotification to prevent state calculation loops
  const updateNotification = useCallback((notification) => {
    console.log('✏️ Updating notification:', notification);
    setNotifications(prev => {
      const updated = prev.map(notif => 
        (notif._id === notification._id || notif.id === notification.id) 
          ? notification 
          : notif
      );
      
      // Recalculate unread count from the updated array
      const unread = updated.filter(notif => !(notif.read || notif.isRead)).length;
      setUnreadCount(unread);
      
      return updated;
    });
  }, []);

  // Fixed removeNotification to prevent state calculation loops
  const removeNotification = useCallback((notificationId) => {
    console.log('➖ Removing notification:', notificationId);
    setNotifications(prev => {
      const notification = prev.find(n => 
        n._id === notificationId || n.id === notificationId
      );
      
      const updated = prev.filter(notif => 
        notif._id !== notificationId && notif.id !== notificationId
      );
      
      if (notification && (!notification.read && !notification.isRead)) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return updated;
    });
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      console.log('📝 Marking notification as read:', notificationId);
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === notificationId || notif.id === notificationId)
            ? { 
                ...notif, 
                read: true,
                isRead: true 
              }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Emit socket event if socket is connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('notification:markRead', { notificationId });
      }
      
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      // Still update UI optimistically
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === notificationId || notif.id === notificationId)
            ? { 
                ...notif, 
                read: true,
                isRead: true 
              }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('📝 Marking all notifications as read');
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true,
          isRead: true 
        }))
      );
      setUnreadCount(0);
      
      // Emit socket event if socket is connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('notification:markAllRead');
      }
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      // Still update UI optimistically
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true,
          isRead: true 
        }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const notification = notifications.find(n => 
        n._id === notificationId || n.id === notificationId
      );
      
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(notif => 
          notif._id !== notificationId && notif.id !== notificationId
        )
      );
      
      if (notification && (!notification.read && !notification.isRead)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Emit socket event if socket is connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('notification:delete', { notificationId });
      }
      
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
    }
  };

  // Refresh notifications manually
  const refreshNotifications = async () => {
    console.log('🔄 Manually refreshing notifications');
    await loadNotifications();
  };

  // Get unread count separately
  const getUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      // Calculate from current notifications as fallback
      const count = notifications.filter(notif => 
        !notif.read && !notif.isRead
      ).length;
      setUnreadCount(count);
      return count;
    }
  };

  // Load initial notifications and connect WebSocket when user logs in
  useEffect(() => {
    if (isAuthenticated && user && token) {
      console.log('🔐 User authenticated, loading notifications...');
      loadNotifications();
      connectWebSocket();
    } else {
      console.log('🔐 User not authenticated, clearing notifications...');
      setNotifications([]);
      setUnreadCount(0);
      setConnected(false);
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, token, loadNotifications, connectWebSocket, disconnectWebSocket]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    connectionError,
    isReconnecting,
    loadNotifications,
    refreshNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    updateNotification,
    removeNotification,
    reconnectWebSocket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};