const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAdminStats } = require('../controllers/adminControllerStats');

// ... other admin routes

router.get('/stats', protect, getAdminStats);

module.exports = router;
