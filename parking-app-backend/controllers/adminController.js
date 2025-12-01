
const ParkingLot = require("../models/ParkingLot");
const Booking = require("../models/Booking");

/**
 * CREATE parking lot (manager-only)
 */
exports.createParkingLot = async (req, res) => {
  try {
    const managerId = req.user.id; // from auth middleware

    const lot = new ParkingLot({
      ...req.body,
      manager: managerId,                      // ensure owner is this manager
      availableSlots: req.body.capacity,       // initialize to capacity
    });

    await lot.save();
    res.status(201).json(lot);
  } catch (err) {
    console.error("createParkingLot error:", err);
    res.status(500).json({ message: "Failed to create parking lot" });
  }
};

/**
 * UPDATE parking lot (manager can update ONLY their own)
 */
exports.updateParkingLot = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { id } = req.params;

    // ensure lot belongs to this manager
    const lot = await ParkingLot.findOne({ _id: id, manager: managerId });
    if (!lot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    Object.assign(lot, req.body);
    await lot.save();

    res.json(lot);
  } catch (err) {
    console.error("updateParkingLot error:", err);
    res.status(500).json({ message: "Failed to update parking lot" });
  }
};

/**
 * DELETE parking lot (manager can delete ONLY their own)
 * Also deletes related bookings for their lots
 */
exports.deleteParkingLot = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { id } = req.params;

    const lot = await ParkingLot.findOne({ _id: id, manager: managerId });
    if (!lot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    // delete related bookings for this lot owned by this manager
    await Booking.deleteMany({ parkingLot: id, manager: managerId });

    await lot.deleteOne();
    res.json({ message: "Parking lot deleted" });
  } catch (err) {
    console.error("deleteParkingLot error:", err);
    res.status(500).json({ message: "Failed to delete parking lot" });
  }
};

/**
 * GET bookings for this manager's lots ONLY
 */
exports.getAllBookings = async (req, res) => {
  try {
    const managerId = req.user.id;

    const bookings = await Booking.find({ manager: managerId })
      .populate("user", "name email")
      .populate(
        "parkingLot",
        "name location city pricePerHour capacity availableSlots"
      );

    res.json(bookings);
  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};

/**
 * GET all parking lots belonging to this manager
 * (if you also need a global admin version, create a separate controller)
 */
exports.getAllParkingLots = async (req, res) => {
  try {
    const managerId = req.user.id;
    const lots = await ParkingLot.find({ manager: managerId });
    res.json(lots);
  } catch (error) {
    console.error("getAllParkingLots error:", error);
    res.status(500).json({ message: "Failed to load parking lots" });
  }
};

/**
 * DELETE booking (manager-only) — restores available slot
 */
exports.deleteBooking = async (req, res) => {
  try {
    const managerId = req.user.id;

    // only delete booking if it belongs to this manager
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      manager: managerId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // restore available slot for that parking lot (if it's this manager's lot)
    const parkingLot = await ParkingLot.findOne({
      _id: booking.parkingLot,
      manager: managerId,
    });

    if (parkingLot) {
      parkingLot.availableSlots = (parkingLot.availableSlots || 0) + 1;

      // do not exceed capacity
      if (
        parkingLot.capacity &&
        parkingLot.availableSlots > parkingLot.capacity
      ) {
        parkingLot.availableSlots = parkingLot.capacity;
      }
      await parkingLot.save();
    }

    res.json({ message: "Booking deleted and slot restored" });
  } catch (error) {
    console.error("deleteBooking error:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
};

/**
 * CONFIRM booking (manager-only) — changes status to confirmed
 */
exports.confirmBooking = async (req, res) => {
  try {
    const managerId = req.user.id;

    // only confirm if booking belongs to this manager
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, manager: managerId },
      { status: "confirmed" },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("parkingLot", "name location city");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    console.error("confirmBooking error:", error);
    res.status(500).json({ message: "Failed to confirm booking" });
  }
};
