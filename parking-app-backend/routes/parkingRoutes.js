const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getParkingLots, 
  bookParking, 
  getMyBookings, 
  addReview,
  cancelBooking,
  editBooking
} = require('../controllers/parkingController');

router.get('/', getParkingLots);
router.post('/book/:id', protect, bookParking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/edit/:id', protect, editBooking);       // Edit booking
router.delete('/cancel/:id', protect, cancelBooking); // Cancel booking
router.post('/review/:id', protect, addReview);

module.exports = router;
