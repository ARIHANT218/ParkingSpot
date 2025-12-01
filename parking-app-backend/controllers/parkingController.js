const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const QRCode = require("qrcode");

// ------------------ Get Parking Lots ------------------
exports.getParkingLots = async (req, res) => {
  try {
    const { city } = req.query;
    const query = city ? { city: { $regex: city, $options: "i" } } : {};

    const parkingLots = await ParkingLot.find(query);
    res.json(parkingLots);
  } catch (error) {
    console.error("getParkingLots error:", error);
    res.status(500).json({ message: "Failed to fetch parking lots" });
  }
};

// ------------------ Book Parking ------------------
exports.bookParking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to book parking" });
    }

    const userId = req.user._id || req.user.id;
    const userName = req.user.name || req.user.fullName || "User";

    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    const { startTime, endTime } = req.body;

    if (parkingLot.availableSlots <= 0) {
      return res.status(400).json({ message: "No available slots" });
    }

    const booking = await Booking.create({
      user: userId,
      parkingLot: parkingLot._id,
      manager: parkingLot.manager, // IMPORTANT FOR MANAGER OWNERSHIP
      startTime,
      endTime,
    });

    // Generate QR Code
    const qrPayload = `Booking:${booking._id} | User:${userName} | Lot:${parkingLot.name}`;
    booking.qrCode = await QRCode.toDataURL(qrPayload);
    await booking.save();

    // Reduce available slots
    parkingLot.availableSlots = Math.max(0, parkingLot.availableSlots - 1);
    await parkingLot.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error("bookParking error:", error);
    res.status(500).json({ message: "Failed to book parking" });
  }
};

// ------------------ Get My Bookings ------------------
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const userId = req.user._id || req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate("parkingLot", "name location city pricePerHour availableSlots");

    res.json(bookings);
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};

// ------------------ Edit Booking ------------------
exports.editBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    const booking = await Booking.findById(req.params.id).populate("parkingLot");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ message: "Not authorized to edit this booking" });
    }

    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("editBooking error:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
};

// ------------------ Cancel Booking ------------------
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("parkingLot");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    const parkingLot = await ParkingLot.findById(booking.parkingLot._id);
    parkingLot.availableSlots = Math.min(parkingLot.capacity, parkingLot.availableSlots + 1);
    await parkingLot.save();

    await booking.deleteOne();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// ------------------ Add Review ------------------
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: "Parking lot not found" });

    const exists = await Review.findOne({
      user: req.user._id || req.user.id,
      parkingLot: parkingLot._id,
    });

    if (exists) {
      return res.status(400).json({ message: "You have already reviewed this parking lot" });
    }

    const review = await Review.create({
      user: req.user._id || req.user.id,
      parkingLot: parkingLot._id,
      rating,
      comment,
    });

    const reviews = await Review.find({ parkingLot: parkingLot._id });
    const avgRating = reviews.reduce((x, r) => x + r.rating, 0) / reviews.length;

    parkingLot.rating = avgRating;
    await parkingLot.save();

    res.status(201).json(review);
  } catch (error) {
    console.error("addReview error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};
