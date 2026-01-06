const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { getMessages, sendMessage , markRead , adminActiveChats, testAdminChats } = require('../controllers/chatController');

// sanity checks
if (typeof protect !== 'function') {
  throw new Error('protect middleware is not a function — check ../middleware/authMiddleware.js export');
}
if (typeof getMessages !== 'function' || typeof sendMessage !== 'function') {
  throw new Error('chatController exports are invalid — check ../controllers/chatController.js');
}

// IMPORTANT: Admin routes must come BEFORE dynamic routes to avoid route conflicts
// admin-only
router.get('/admin/active', protect, admin, adminActiveChats);

// test endpoint
router.get('/test', protect, admin, testAdminChats);

// Dynamic routes (must come after specific routes)
router.get('/:bookingId', protect, getMessages);
router.post('/:bookingId', protect, sendMessage);
router.patch('/:bookingId/read', protect, markRead);

module.exports = router;
