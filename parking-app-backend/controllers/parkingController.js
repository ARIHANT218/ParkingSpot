const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const QRCode = require('qrcode');

// ------------------ Get Parking Lots ------------------
exports.getParkingLots = async (req, res) => {
  try {
    const { city } = req.query;
    const query = city ? { city: { $regex: city, $options: 'i' } } : {};
    const parkingLots = await ParkingLot.find(query);
    res.json(parkingLots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// controllers/adminController.js (bookParking)
exports.bookParking = async (req, res) => {
  try {
    // Defensive checks
    if (!req.user) {
      return res.status(401).json({ message: 'You must be logged in to book parking' });
    }

    const userId = req.user._id || req.user.id; // support both shapes
    const userName = req.user.name || req.user.fullName || 'User';

    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

    const { startTime, endTime } = req.body;

    if (parkingLot.availableSlots <= 0) {
      return res.status(400).json({ message: 'No available slots' });
    }

    const booking = await Booking.create({
      user: userId,
      parkingLot: parkingLot._id,
      startTime,
      endTime
    });

    // Generate QR code for booking
    const qrData = `BookingID:${booking._id} User:${userName} ParkingLot:${parkingLot.name}`;
    const qrCode = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCode;
    await booking.save();

    // Decrease available slots
    parkingLot.availableSlots -= 1;
    await parkingLot.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('bookParking error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ------------------ Get User's Bookings ------------------
// getMyBookings
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const userId = req.user._id || req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('parkingLot', 'name location city pricePerHour availableSlots');
    res.json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------ Edit Booking ------------------
exports.editBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const booking = await Booking.findById(req.params.id).populate('parkingLot');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to edit this booking' });

    // Update booking times
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------ Cancel Booking ------------------
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingLot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });

    // Increase parking lot availability
    const parkingLot = await ParkingLot.findById(booking.parkingLot._id);
    parkingLot.availableSlots += 1;
    await parkingLot.save();

    await booking.remove();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------ Add Review ------------------
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

    const alreadyReviewed = await Review.findOne({ user: req.user._id, parkingLot: parkingLot._id });
    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this parking lot' });

    const review = await Review.create({
      user: req.user._id,
      parkingLot: parkingLot._id,
      rating,
      comment
    });

    // Update parking lot rating dynamically
    const reviews = await Review.find({ parkingLot: parkingLot._id });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    parkingLot.rating = avgRating;
    await parkingLot.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
