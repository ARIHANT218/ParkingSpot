// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  getAllBookings,
  getAllParkingLots,
  deleteBooking,
  confirmBooking
} = require('../controllers/adminController');


router.post('/parking-lot', protect, authorize('manager'), createParkingLot);

// Get all parking lots (admin view)
router.get('/parking-lots', protect, authorize('manager'), getAllParkingLots);

// Update parking lot
router.put('/parking-lot/:id', protect, authorize('manager'), updateParkingLot);

// Delete parking lot
router.delete('/parking-lot/:id', protect, authorize('manager'), deleteParkingLot);

// Get all bookings
router.get('/bookings', protect, authorize('manager'), getAllBookings);

// Delete a booking (manager)
router.delete('/bookings/:id', protect, authorize('manager'), deleteBooking);

// Confirm a booking (manager)
router.patch('/bookings/:id/confirm', protect, authorize('manager'), confirmBooking);

module.exports = router;
