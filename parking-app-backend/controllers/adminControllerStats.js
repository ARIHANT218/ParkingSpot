const User = require('../models/user');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot'); // if you need later

// GET /api/admin/stats   (admin only)
exports.getAdminStats = async (req, res) => {
  try {
    // only allow admins
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const activeUsers = await User.countDocuments({ role: 'user' });
    const parkingManagers = await User.countDocuments({ role: 'manager' });

    const bookings = await Booking.find({});
    const totalBookings = bookings.length;

    // if you have a field like totalPrice on booking, use that
    const totalRevenue = bookings.reduce((sum, b) => {
      return sum + (b.totalPrice || 0);
    }, 0);

    res.json({
      activeUsers,
      parkingManagers,
      totalBookings,
      totalRevenue,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ message: 'Failed to load admin stats' });
  }
};
