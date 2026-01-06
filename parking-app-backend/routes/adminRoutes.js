// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  getAllBookings,
  getAllParkingLots,
  deleteBooking,
  confirmBooking,
  getAllUsers,
  updateUserRole
} = require('../controllers/adminController');

// Create a parking lot
router.post('/parking-lot', protect, admin, createParkingLot);

// Get all parking lots (admin view)
router.get('/parking-lots', protect, admin, getAllParkingLots);

// Update parking lot
router.put('/parking-lot/:id', protect, admin, updateParkingLot);

// Delete parking lot
router.delete('/parking-lot/:id', protect, admin, deleteParkingLot);

// Get all bookings
router.get('/bookings', protect, admin, getAllBookings);

// Delete a booking (admin)
router.delete('/bookings/:id', protect, admin, deleteBooking);

// Confirm a booking (admin)
router.patch('/bookings/:id/confirm', protect, admin, confirmBooking);

// Get all users (admin only)
router.get('/users', protect, admin, getAllUsers);

// Update user role (promote/demote)
router.patch('/users/:userId/role', protect, admin, updateUserRole);

module.exports = router;
