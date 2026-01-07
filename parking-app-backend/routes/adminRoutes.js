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


router.post('/parking-lot', protect, admin, createParkingLot);


router.get('/parking-lots', protect, admin, getAllParkingLots);


router.put('/parking-lot/:id', protect, admin, updateParkingLot);

router.delete('/parking-lot/:id', protect, admin, deleteParkingLot);


router.get('/bookings', protect, admin, getAllBookings);


router.delete('/bookings/:id', protect, admin, deleteBooking);


router.patch('/bookings/:id/confirm', protect, admin, confirmBooking);


router.get('/users', protect, admin, getAllUsers);


router.patch('/users/:userId/role', protect, admin, updateUserRole);

module.exports = router;
