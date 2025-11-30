const express = require('express');
const router = express.Router();
const {
  getUsers,
  checkAdmin,
  resetAdminPassword,
  emergencyAdminReset,
  setupAdmin
} = require('../controllers/debugController');

router.get('/users', getUsers);
router.get('/admin-check', checkAdmin);
router.post('/reset-admin-password', resetAdminPassword);
router.post('/emergency/admin-reset', emergencyAdminReset);
router.post('/admin/setup', setupAdmin);

module.exports = router;