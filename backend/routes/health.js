// backend/routes/health.js - CREATE THIS FILE
const express = require('express');
const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      message: 'GrantFlow CRM API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'API health check failed',
      error: error.message
    });
  }
});

module.exports = router;