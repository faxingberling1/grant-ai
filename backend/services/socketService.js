const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://grant-ai-eight.vercel.app',
        'https://grant-ai-git-main-alex-murphys-projects.vercel.app',
        'https://grant-ai-alex-murphys-projects.vercel.app',
        'https://*.vercel.app'
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('❌ No token provided for socket connection');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('❌ User not found for socket connection');
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.approved) {
        console.log('❌ User not approved for socket connection:', user.email);
        return next(new Error('Authentication error: User not approved'));
      }

      socket.userId = user._id.toString();
      socket.userEmail = user.email;
      socket.userData = user.toObject();
      console.log(`✅ Socket authenticated for user: ${user.email}`);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected to notifications:', socket.id, socket.userEmail);

    // Automatically join user to their personal room using user: prefix
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`👤 User ${socket.userEmail} automatically joined room: ${userRoom}`);

    // Handle join-user-room event (backward compatibility)
    socket.on('join-user-room', (userId) => {
      // Verify the user is joining their own room
      if (userId !== socket.userId) {
        console.log(`❌ User ${socket.userEmail} tried to join room for user ${userId}`);
        return;
      }
      
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      console.log(`👤 User ${socket.userEmail} joined their notification room: ${userRoom}`);
    });

    // Handle notification events from clients
    socket.on('notification:markRead', async (data) => {
      try {
        const { notificationId } = data;
        console.log(`📢 User ${socket.userEmail} marking notification as read:`, notificationId);
        
        // Emit to other clients of the same user
        socket.to(`user:${socket.userId}`).emit('notification:update', {
          _id: notificationId,
          isRead: true,
          updatedAt: new Date()
        });
        
      } catch (error) {
        console.error('❌ Error handling notification markRead:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    socket.on('notification:markAllRead', async () => {
      try {
        console.log(`📢 User ${socket.userEmail} marking all notifications as read`);
        
        // Emit to other clients of the same user
        socket.to(`user:${socket.userId}`).emit('notification:markAllRead');
        
      } catch (error) {
        console.error('❌ Error handling notification markAllRead:', error);
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });

    socket.on('notification:delete', async (data) => {
      try {
        const { notificationId } = data;
        console.log(`📢 User ${socket.userEmail} deleting notification:`, notificationId);
        
        // Emit to other clients of the same user
        socket.to(`user:${socket.userId}`).emit('notification:delete', {
          notificationId
        });
        
      } catch (error) {
        console.error('❌ Error handling notification delete:', error);
        socket.emit('error', { message: 'Failed to delete notification' });
      }
    });

    // Handle typing indicators for real-time collaboration
    socket.on('typing:start', (data) => {
      const { documentId, userName } = data;
      socket.to(`doc:${documentId}`).emit('typing:start', {
        userId: socket.userId,
        userName: userName || socket.userEmail,
        documentId
      });
    });

    socket.on('typing:stop', (data) => {
      const { documentId } = data;
      socket.to(`doc:${documentId}`).emit('typing:stop', {
        userId: socket.userId,
        documentId
      });
    });

    // Handle document collaboration
    socket.on('document:join', (documentId) => {
      socket.join(`doc:${documentId}`);
      console.log(`📝 User ${socket.userEmail} joined document: ${documentId}`);
    });

    socket.on('document:leave', (documentId) => {
      socket.leave(`doc:${documentId}`);
      console.log(`📝 User ${socket.userEmail} left document: ${documentId}`);
    });

    // Handle real-time meeting updates
    socket.on('meeting:join', (meetingId) => {
      socket.join(`meeting:${meetingId}`);
      console.log(`🎯 User ${socket.userEmail} joined meeting: ${meetingId}`);
    });

    socket.on('meeting:update', (data) => {
      const { meetingId, update } = data;
      socket.to(`meeting:${meetingId}`).emit('meeting:updated', {
        meetingId,
        update,
        updatedBy: socket.userEmail,
        timestamp: new Date()
      });
    });

    // Handle connection health check
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({
          status: 'pong',
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle connection status
    socket.on('connection:status', (callback) => {
      if (typeof callback === 'function') {
        callback({
          connected: true,
          userId: socket.userId,
          userEmail: socket.userEmail,
          socketId: socket.id,
          rooms: Array.from(socket.rooms),
          serverTime: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 User disconnected from notifications:', socket.id, socket.userEmail, reason);
      
      // Emit user offline status to relevant rooms
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        timestamp: new Date()
      });
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', socket.userEmail, error);
    });

    // Emit connection success to client
    socket.emit('connection:established', {
      message: 'Successfully connected to real-time notification service',
      userId: socket.userId,
      userEmail: socket.userEmail,
      timestamp: new Date().toISOString()
    });

    // Emit user online status to relevant rooms
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      timestamp: new Date()
    });
  });

  // Handle server-wide events
  io.on('error', (error) => {
    console.error('❌ Socket.IO server error:', error);
  });

  // Make io globally available for notification service
  global.io = io;
  console.log('✅ WebSocket notification system initialized');

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper function to check if user is connected
const isUserConnected = (userId) => {
  if (!io) return false;
  
  const userRoom = `user:${userId}`;
  const room = io.sockets.adapter.rooms.get(userRoom);
  return room ? room.size > 0 : false;
};

// Helper function to get connected users count
const getConnectedUsersCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

// Helper function to get user's socket connections
const getUserSockets = (userId) => {
  if (!io) return [];
  
  const userRoom = `user:${userId}`;
  const room = io.sockets.adapter.rooms.get(userRoom);
  if (!room) return [];
  
  const sockets = [];
  room.forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      sockets.push({
        id: socket.id,
        connected: socket.connected,
        rooms: Array.from(socket.rooms)
      });
    }
  });
  
  return sockets;
};

// Helper function to send notification to user
const sendToUser = (userId, event, data) => {
  if (!io) {
    console.warn('⚠️ Socket.io not initialized, cannot send notification');
    return false;
  }
  
  try {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit(event, data);
    console.log(`📢 Sent ${event} to user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification to user:', error);
    return false;
  }
};

// Helper function to send notification to multiple users
const sendToUsers = (userIds, event, data) => {
  if (!io) {
    console.warn('⚠️ Socket.io not initialized, cannot send notifications');
    return false;
  }
  
  try {
    userIds.forEach(userId => {
      const userRoom = `user:${userId}`;
      io.to(userRoom).emit(event, data);
    });
    console.log(`📢 Sent ${event} to ${userIds.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notifications to users:', error);
    return false;
  }
};

// Helper function to broadcast to all connected clients
const broadcast = (event, data) => {
  if (!io) {
    console.warn('⚠️ Socket.io not initialized, cannot broadcast');
    return false;
  }
  
  try {
    io.emit(event, data);
    console.log(`📢 Broadcast ${event} to all connected clients`);
    return true;
  } catch (error) {
    console.error('❌ Error broadcasting:', error);
    return false;
  }
};

// Helper function to get server statistics
const getServerStats = () => {
  if (!io) {
    return {
      connected: false,
      connectedUsers: 0,
      totalRooms: 0,
      userRooms: 0
    };
  }
  
  try {
    const rooms = Array.from(io.sockets.adapter.rooms);
    const userRooms = rooms.filter(room => room[0].startsWith('user:'));
    
    return {
      connected: true,
      connectedUsers: io.engine.clientsCount,
      totalRooms: rooms.length,
      userRooms: userRooms.length,
      documentRooms: rooms.filter(room => room[0].startsWith('doc:')).length,
      meetingRooms: rooms.filter(room => room[0].startsWith('meeting:')).length
    };
  } catch (error) {
    console.error('❌ Error getting server stats:', error);
    return {
      connected: false,
      error: error.message
    };
  }
};

// Helper function to disconnect user
const disconnectUser = (userId) => {
  if (!io) return false;
  
  try {
    const userRoom = `user:${userId}`;
    const room = io.sockets.adapter.rooms.get(userRoom);
    if (!room) return false;
    
    room.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    });
    
    console.log(`🔌 Disconnected all sockets for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error disconnecting user:', error);
    return false;
  }
};

module.exports = {
  initializeSocket,
  getIO,
  isUserConnected,
  getConnectedUsersCount,
  getUserSockets,
  sendToUser,
  sendToUsers,
  broadcast,
  getServerStats,
  disconnectUser
};