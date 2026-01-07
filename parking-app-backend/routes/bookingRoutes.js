const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/', protect, bookingController.createBooking);
router.get('/:id', protect, bookingController.getBookingById);
router.get('/user/:userId', protect, bookingController.getBookingsByUser);
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
