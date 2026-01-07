const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const QRCode = require('qrcode');

exports.getParkingLots = async (req, res) => {
  try {
    const { city } = req.query;

    const filter = city
      ? { city: { $regex: city, $options: 'i' } }
      : {};

    const parkingLots = await ParkingLot.find(filter);
    res.json(parkingLots);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.bookParking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'You must be logged in to book parking' });
    }

    const userId = req.user._id || req.user.id;
    const userName = req.user.name || req.user.fullName || 'User';

    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

    const { startTime, endTime } = req.body;

    if (parkingLot.availableSlots <= 0) {
      return res.status(400).json({ message: 'No available slots' });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      parkingLot: parkingLot._id,
      startTime,
      endTime,
      status: 'pending'
    });

    // Generate QR code
    const qrData = `BookingID:${booking._id} User:${userName} ParkingLot:${parkingLot.name}`;
    booking.qrCode = await QRCode.toDataURL(qrData);
    await booking.save();

    
    parkingLot.availableSlots -= 1;
    await parkingLot.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('bookParking error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const userId = req.user._id || req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate('parkingLot', 'name location city pricePerHour availableSlots')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.editBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }

    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingLot');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Restore slot if booking was active
    if (booking.parkingLot && ['pending', 'confirmed'].includes(booking.status)) {
      const lot = await ParkingLot.findById(booking.parkingLot._id);
      if (lot) {
        lot.availableSlots = Math.min((lot.availableSlots || 0) + 1, lot.capacity);
        await lot.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

    // Prevent duplicate reviews
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      parkingLot: parkingLot._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this parking lot' });
    }

    const review = await Review.create({
      user: req.user._id,
      parkingLot: parkingLot._id,
      rating,
      comment
    });


    const reviews = await Review.find({ parkingLot: parkingLot._id });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    parkingLot.rating = avgRating;
    await parkingLot.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
