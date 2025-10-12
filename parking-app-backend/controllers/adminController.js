// controllers/adminController.js
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');

// Create Parking Lot
exports.createParkingLot = async (req, res) => {
  try {
    const {
      name,
      location,
      city,
      pricePerHour,
      capacity,
      availableSlots,
      amenities
    } = req.body;

    if (!name || !location || !city || !pricePerHour || !capacity) {
      return res.status(400).json({ message: 'name, location, city, pricePerHour and capacity are required' });
    }

    const lot = await ParkingLot.create({
      name,
      location,
      city,
      pricePerHour: Number(pricePerHour),
      capacity: Number(capacity),
      // if availableSlots not provided, set it equal to capacity
      availableSlots: typeof availableSlots !== 'undefined' ? Number(availableSlots) : Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(',').map(a => a.trim()) : [])
    });

    return res.status(201).json(lot);
  } catch (error) {
    console.error('createParkingLot error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Update Parking Lot
exports.updateParkingLot = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.pricePerHour) updates.pricePerHour = Number(updates.pricePerHour);
    if (updates.capacity) updates.capacity = Number(updates.capacity);
    if (typeof updates.availableSlots !== 'undefined') updates.availableSlots = Number(updates.availableSlots);

    const parkingLot = await ParkingLot.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });
    res.json(parkingLot);
  } catch (error) {
    console.error('updateParkingLot error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Parking Lot (and optionally related bookings)
exports.deleteParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findByIdAndDelete(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

    // Optional: delete bookings associated with this parking lot
    await Booking.deleteMany({ parkingLot: parkingLot._id });

    res.json({ message: 'Parking lot deleted and related bookings removed' });
  } catch (error) {
    console.error('deleteParkingLot error:', error);
    res.status(400).json({ message: error.message });
  }
};

// View all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city pricePerHour capacity availableSlots');
    res.json(bookings);
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET all parking lots (admin)
exports.getAllParkingLots = async (req, res) => {
  try {
    const lots = await ParkingLot.find();
    res.json(lots);
  } catch (error) {
    console.error('getAllParkingLots error:', error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE booking (admin) — restores available slot
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Restore available slot if parking lot exists
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    if (parkingLot) {
      parkingLot.availableSlots = (parkingLot.availableSlots || 0) + 1;
      // ensure availableSlots doesn't exceed capacity
      if (parkingLot.capacity && parkingLot.availableSlots > parkingLot.capacity) {
        parkingLot.availableSlots = parkingLot.capacity;
      }
      await parkingLot.save();
    }

    res.json({ message: 'Booking deleted and slot restored' });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(400).json({ message: error.message });
  }
};
