const socketIO = require('socket.io');
const { getEnvConfig } = require('../config/environment');

let io;

const initializeSocket = (server) => {
  const config = getEnvConfig();
  
  io = socketIO(server, {
    cors: {
      origin: config.CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected to notifications:', socket.id);

    socket.on('join-user-room', (userId) => {
      socket.join(userId.toString());
      console.log(`👤 User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected from notifications:', socket.id);
    });
  });

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

module.exports = {
  initializeSocket,
  getIO
};