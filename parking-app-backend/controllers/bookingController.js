const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const QRCode = require('../utils/generateQR');

exports.createBooking = async (req, res) => {
    try {
        const { parkingLot, startTime, endTime } = req.body;
        const booking = new Booking({
            user: req.user.userId,
            parkingLot,
            startTime,
            endTime,
            status: 'active',
        });
        booking.qrCode = await QRCode.generate(booking._id.toString());
        await booking.save();
        await ParkingLot.findByIdAndUpdate(parkingLot, { $inc: { availableSpots: -1 } });
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('parkingLot');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId });
        res.json(bookings);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        await ParkingLot.findByIdAndUpdate(booking.parkingLot, { $inc: { availableSpots: 1 } });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
