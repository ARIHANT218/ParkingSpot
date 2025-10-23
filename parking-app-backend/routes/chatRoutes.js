const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage , markRead , adminActiveChats, testAdminChats } = require('../controllers/chatController');

// sanity checks
if (typeof protect !== 'function') {
  throw new Error('protect middleware is not a function — check ../middleware/authMiddleware.js export');
}
if (typeof getMessages !== 'function' || typeof sendMessage !== 'function') {
  throw new Error('chatController exports are invalid — check ../controllers/chatController.js');
}

router.get('/:bookingId', protect, getMessages);
router.post('/:bookingId', protect, sendMessage);

router.patch('/:bookingId/read', protect, markRead);

// admin-only
router.get('/admin/active', protect, adminActiveChats);

// test endpoint
router.get('/test', testAdminChats);

module.exports = router;
