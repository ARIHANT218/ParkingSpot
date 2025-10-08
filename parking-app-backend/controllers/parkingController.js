const ParkingLot = require('../models/ParkingLot');

exports.getAllParkingLots = async (req, res) => {
    try {
        const { city } = req.query;
        const filter = city ? { city } : {};
        const lots = await ParkingLot.find(filter);
        res.json(lots);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getParkingLotById = async (req, res) => {
    try {
        const lot = await ParkingLot.findById(req.params.id);
        if (!lot) return res.status(404).json({ error: 'Parking lot not found' });
        res.json(lot);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.createParkingLot = async (req, res) => {
    try {
        const lot = new ParkingLot(req.body);
        await lot.save();
        res.status(201).json(lot);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateParkingLot = async (req, res) => {
    try {
        const lot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lot) return res.status(404).json({ error: 'Parking lot not found' });
        res.json(lot);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteParkingLot = async (req, res) => {
    try {
        const lot = await ParkingLot.findByIdAndDelete(req.params.id);
        if (!lot) return res.status(404).json({ error: 'Parking lot not found' });
        res.json({ message: 'Parking lot deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
