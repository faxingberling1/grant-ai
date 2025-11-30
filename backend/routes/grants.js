const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getGrantSources,
  getGrantSourceById,
  createGrant,
  getUserGrants,
  updateGrant
} = require('../controllers/grantController');

// Grant sources (public grants database)
router.get('/sources', authMiddleware, getGrantSources);
router.get('/sources/:id', authMiddleware, getGrantSourceById);

// User's grants
router.get('/', authMiddleware, getUserGrants);
router.post('/', authMiddleware, createGrant);
router.put('/:id', authMiddleware, updateGrant);

module.exports = router;