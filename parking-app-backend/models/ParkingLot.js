const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: Number,   // add this
  longitude: Number, 
  city: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  capacity: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  amenities: [String],
  rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
