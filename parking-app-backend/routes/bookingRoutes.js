const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.get('/user/:userId', authMiddleware, bookingController.getBookingsByUser);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
