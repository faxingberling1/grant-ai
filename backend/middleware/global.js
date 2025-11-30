// backend/middleware/global.js
const cors = require('cors');
const config = require('../config');

module.exports = (app) => {
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
  }));

  app.use(require('express').json());

  // Request logger (dev-friendly)
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    next();
  });
};