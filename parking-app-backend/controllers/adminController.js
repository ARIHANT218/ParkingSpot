const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const User = require('../models/user');

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
      amenities,
      latitude,
      longitude
    } = req.body;

    if (!name || !location || !city || !pricePerHour || !capacity) {
      return res.status(400).json({ message: 'name, location, city, pricePerHour and capacity are required' });
    }

  
    const ownerId = req.user._id || req.user.id;

    const lot = await ParkingLot.create({
      name,
      location,
      city,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      pricePerHour: Number(pricePerHour),
      capacity: Number(capacity),
      
      availableSlots: typeof availableSlots !== 'undefined' ? Number(availableSlots) : Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(',').map(a => a.trim()) : []),
      owner: ownerId
    });

    const populatedLot = await ParkingLot.findById(lot._id).populate('owner', 'name email');

    return res.status(201).json(populatedLot);
  } catch (error) {
    console.error('createParkingLot error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Update Parking Lot
exports.updateParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

   
    const ownerId = req.user._id || req.user.id;
    if (parkingLot.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You can only update your own parking lots' });
    }

    const updates = { ...req.body };
   
    delete updates.owner;
    
    if (updates.pricePerHour) updates.pricePerHour = Number(updates.pricePerHour);
    if (updates.capacity) updates.capacity = Number(updates.capacity);
    if (typeof updates.availableSlots !== 'undefined') updates.availableSlots = Number(updates.availableSlots);
    if (updates.latitude) updates.latitude = Number(updates.latitude);
    if (updates.longitude) updates.longitude = Number(updates.longitude);

    const updatedLot = await ParkingLot.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('owner', 'name email');
    
    res.json(updatedLot);
  } catch (error) {
    console.error('updateParkingLot error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Parking Lot 
exports.deleteParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });

   
    const ownerId = req.user._id || req.user.id;
    if (parkingLot.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own parking lots' });
    }

  
    await Booking.deleteMany({ parkingLot: parkingLot._id });

    await ParkingLot.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parking lot deleted and related bookings removed' });
  } catch (error) {
    console.error('deleteParkingLot error:', error);
    res.status(400).json({ message: error.message });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;
    
   
    const ownedParkingLots = await ParkingLot.find({ owner: ownerId }).select('_id');
    const parkingLotIds = ownedParkingLots.map(lot => lot._id);
    
   
    const bookings = await Booking.find({ parkingLot: { $in: parkingLotIds } })
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city pricePerHour capacity availableSlots')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET all parking lots (admin) - only returns parking lots owned by the current admin
exports.getAllParkingLots = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const lots = await ParkingLot.find({ owner: ownerId })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(lots);
  } catch (error) {
    console.error('getAllParkingLots error:', error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE booking (admin) — restores available slot (only for own parking lots)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingLot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

   
    const ownerId = req.user._id || req.user.id;
    const parkingLot = await ParkingLot.findById(booking.parkingLot._id || booking.parkingLot);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });
    
    if (parkingLot.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You can only delete bookings for your own parking lots' });
    }

   
    parkingLot.availableSlots = (parkingLot.availableSlots || 0) + 1;
  
    if (parkingLot.capacity && parkingLot.availableSlots > parkingLot.capacity) {
      parkingLot.availableSlots = parkingLot.capacity;
    }
    await parkingLot.save();

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted and slot restored' });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(400).json({ message: error.message });
  }
};

// CONFIRM booking (admin) — changes status to confirmed (only for own parking lots)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingLot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

  
    const ownerId = req.user._id || req.user.id;
    const parkingLot = await ParkingLot.findById(booking.parkingLot._id || booking.parkingLot);
    if (!parkingLot) return res.status(404).json({ message: 'Parking lot not found' });
    
    if (parkingLot.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You can only confirm bookings for your own parking lots' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: 'confirmed' }, 
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('parkingLot', 'name location city');
    
    res.json({ message: 'Booking confirmed successfully', booking: updatedBooking });
  } catch (error) {
    console.error('confirmBooking error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Booking controller methods for bookingRoutes
exports.createBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'You must be logged in to book parking' });
    }

    const userId = req.user._id || req.user.id;
    const { parkingLot, startTime, endTime } = req.body;

    if (!parkingLot || !startTime || !endTime) {
      return res.status(400).json({ message: 'parkingLot, startTime, and endTime are required' });
    }

    const parkingLotDoc = await ParkingLot.findById(parkingLot);
    if (!parkingLotDoc) return res.status(404).json({ message: 'Parking lot not found' });

    if (parkingLotDoc.availableSlots <= 0) {
      return res.status(400).json({ message: 'No available slots' });
    }

    const booking = await Booking.create({
      user: userId,
      parkingLot: parkingLotDoc._id,
      startTime,
      endTime,
      status: 'pending'
    });

   
    parkingLotDoc.availableSlots -= 1;
    await parkingLotDoc.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city pricePerHour');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city pricePerHour capacity availableSlots');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

   
    const userId = req.user._id || req.user.id;
    if (booking.user._id.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

   
    if (userId !== currentUserId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({ user: userId })
      .populate('parkingLot', 'name location city pricePerHour availableSlots')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('getBookingsByUser error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingLot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const userId = req.user._id || req.user.id;
    // Check if user owns the booking or is admin
    if (booking.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Store original status before updating
    const originalStatus = booking.status;

    // Restore available slot if parking lot exists and booking was confirmed/pending
    if (booking.parkingLot && (originalStatus === 'confirmed' || originalStatus === 'pending')) {
      const parkingLot = await ParkingLot.findById(booking.parkingLot._id);
      if (parkingLot) {
        parkingLot.availableSlots = Math.min(
          (parkingLot.availableSlots || 0) + 1,
          parkingLot.capacity
        );
        await parkingLot.save();
      }
    }

    // Update status instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Promote user to admin or demote admin to user
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    // Prevent self-demotion (optional security feature)
    if (userId === req.user._id.toString() && isAdmin === false) {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: Boolean(isAdmin) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: `User ${isAdmin ? 'promoted to admin' : 'demoted to regular user'} successfully`,
      user
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(400).json({ message: error.message });
  }
};